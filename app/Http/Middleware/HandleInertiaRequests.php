<?php

namespace App\Http\Middleware;

use App\Models\Announcement;
use App\Models\GlobalAnnouncement;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $features = [];
        $announcements = [];
        $user = null;

        if ($request->user()) {
            $user = $request->user()->load('role');
            $features = SystemSetting::where('type', 'feature_toggle')
                ->pluck('value', 'key')
                ->map(fn ($v) => filter_var($v, FILTER_VALIDATE_BOOLEAN))
                ->toArray();

            $roleName = $user->role?->role_name;

            $regular = Announcement::where(function ($q) use ($roleName) {
                $q->whereNull('target_role')
                    ->orWhere('target_role', '')
                    ->orWhere('target_role', 'all')
                    ->orWhere('target_role', $roleName);
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
                    'sort_at' => $a->created_at->timestamp,
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
                    'sort_at' => $a->created_at->timestamp,
                ]);

            $announcements = $regular->concat($global)->sortByDesc('sort_at')->values()->map(fn ($a) => collect($a)->except('sort_at')->toArray())->toArray();
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
            ],
            'features' => $features,
            'announcements' => $announcements,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
