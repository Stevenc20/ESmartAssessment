<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ErrorLog;
use App\Models\LoginSession;
use App\Models\UserLog;
use Inertia\Inertia;

class MonitoringController extends Controller
{
    public function index()
    {
        $recentLogins = LoginSession::with('user')
            ->latest('login_at')
            ->take(20)
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'user_name' => $s->user?->name ?? '-',
                'ip_address' => $s->ip_address,
                'login_at' => $s->login_at?->diffForHumans(),
                'device_type' => $s->device_type,
            ]);

        $recentActivities = UserLog::with('user')
            ->latest()
            ->take(20)
            ->get()
            ->map(fn ($l) => [
                'id' => $l->id,
                'user_name' => $l->user?->name ?? '-',
                'activity' => $l->activity,
                'created_at' => $l->created_at->diffForHumans(),
                'ip_address' => $l->ip_address,
            ]);

        $recentErrors = ErrorLog::with('user')
            ->latest('occurred_at')
            ->take(20)
            ->get()
            ->map(fn ($e) => [
                'id' => $e->id,
                'level' => $e->level,
                'message' => $e->message,
                'file' => $e->file,
                'line' => $e->line,
                'occurred_at' => $e->occurred_at?->diffForHumans(),
                'user_name' => $e->user?->name ?? '-',
            ]);

        return Inertia::render('admin/monitoring/index', [
            'recentLogins' => $recentLogins,
            'recentActivities' => $recentActivities,
            'recentErrors' => $recentErrors,
        ]);
    }
}
