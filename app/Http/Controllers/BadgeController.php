<?php

namespace App\Http\Controllers;

use App\Services\BadgeService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BadgeController extends Controller
{
    public function index(Request $request)
    {
        $siswa = $request->user();

        $badges = app(BadgeService::class)->getBadgesWithStatus($siswa);
        $stats = app(BadgeService::class)->getStudentStats($siswa);

        return Inertia::render('badge/index', [
            'badges' => $badges,
            'stats' => $stats,
        ]);
    }
}
