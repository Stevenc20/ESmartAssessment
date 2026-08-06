<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AnnouncementService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'list' => app(AnnouncementService::class)->listForUser($request->user()),
        ]);
    }

    public function unreadCounts(Request $request)
    {
        return response()->json([
            'unreadCounts' => app(AnnouncementService::class)->unreadCountsForUser($request->user()),
        ]);
    }

    public function stream(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $since = max(0, (int) $request->query('since', 0));

        $response = new StreamedResponse(function () use ($request, $since) {
            set_time_limit(0);
            $request->session()->save();

            $lastVersion = Cache::get('announcement_version', 0);
            $catchUp = $since < $lastVersion;

            echo "event: connected\n";
            echo 'data: {"version": '.$lastVersion."}\n\n";
            ob_flush();
            flush();

            if ($catchUp) {
                echo "event: refresh\n";
                echo 'data: {"version": '.$lastVersion."}\n\n";
                ob_flush();
                flush();
            }

            while (true) {
                if (connection_aborted()) {
                    break;
                }

                $currentVersion = Cache::get('announcement_version', 0);

                if ($currentVersion > $lastVersion) {
                    $lastVersion = $currentVersion;
                    echo "event: refresh\n";
                    echo 'data: {"version": '.$currentVersion."}\n\n";
                    ob_flush();
                    flush();
                }

                sleep(3);
            }
        });

        $response->headers->set('Content-Type', 'text/event-stream');
        $response->headers->set('Cache-Control', 'no-cache');
        $response->headers->set('X-Accel-Buffering', 'no');
        $response->headers->set('Connection', 'keep-alive');

        return $response;
    }
}
