<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\GlobalAnnouncement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $roleName = $user->role?->role_name;

        $regular = Announcement::where(function ($q) use ($roleName) {
            $q->whereNull('target_role')
                ->orWhere('target_role', '')
                ->orWhere('target_role', 'all')
                ->orWhere('target_role', $roleName);
        })
            ->where(function ($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            })
            ->latest()
            ->get()
            ->map(fn ($a) => [
                'id' => 'announcement_'.$a->id,
                'judul' => $a->judul,
                'isi' => $a->isi,
                'type' => 'info',
                'source' => 'announcements',
                'created_at' => $a->created_at->format('d M Y'),
            ]);

        $global = GlobalAnnouncement::where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            })
            ->where(function ($q) use ($roleName) {
                $q->whereNull('target_role')
                    ->orWhere('target_role', '')
                    ->orWhere('target_role', 'all')
                    ->orWhere('target_role', $roleName);
            })
            ->latest()
            ->get()
            ->map(fn ($a) => [
                'id' => 'global_'.$a->id,
                'judul' => $a->judul,
                'isi' => $a->isi,
                'type' => $a->type,
                'source' => 'global_announcements',
                'created_at' => $a->created_at->format('d M Y'),
            ]);

        $list = $regular->concat($global)->sortByDesc('created_at')->values();

        return response()->json(['list' => $list]);
    }

    public function stream(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $response = new StreamedResponse(function () use ($request, $user) {
            $request->session()->save();

            $lastVersion = Cache::get('announcement_version', 0);

            echo "event: connected\n";
            echo "data: {}\n\n";
            ob_flush();
            flush();

            while (true) {
                if (connection_aborted()) {
                    break;
                }

                $currentVersion = Cache::get('announcement_version', 0);

                if ($currentVersion > $lastVersion) {
                    $lastVersion = $currentVersion;
                    echo "event: refresh\n";
                    echo "data: {\"version\": {$currentVersion}}\n\n";
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
