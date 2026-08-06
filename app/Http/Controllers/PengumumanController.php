<?php

namespace App\Http\Controllers;

use App\Services\AnnouncementService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PengumumanController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $announcementService = app(AnnouncementService::class);
        $list = $announcementService->listForUser($user);
        $announcementService->markAllRead($user);

        return Inertia::render('pengumuman/index', [
            'list' => $list,
        ]);
    }
}
