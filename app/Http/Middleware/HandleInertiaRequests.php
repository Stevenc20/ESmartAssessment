<?php

namespace App\Http\Middleware;

use App\Models\SystemSetting;
use App\Services\AnnouncementService;
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
        $kelasSiswa = null;
        $user = null;
        $unreadCounts = ['pengumuman' => 0, 'materi' => 0, 'assessment' => 0];

        if ($request->user()) {
            $user = $request->user()->load('role');
            $features = SystemSetting::where('type', 'feature_toggle')
                ->pluck('value', 'key')
                ->map(fn ($v) => filter_var($v, FILTER_VALIDATE_BOOLEAN))
                ->toArray();

            $announcementService = app(AnnouncementService::class);

            $announcements = $announcementService->listForUser($user);
            $unreadCounts = $announcementService->unreadCountsForUser($user);

            if ($user->role?->role_name === 'siswa') {
                $kelas = $announcementService->kelasForUser($user);
                if ($kelas) {
                    $kelasSiswa = [
                        'id' => $kelas->id,
                        'nama_kelas' => $kelas->nama_kelas,
                        'tingkat' => $kelas->tingkat,
                    ];
                }
            }
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
            ],
            'features' => $features,
            'announcements' => $announcements,
            'kelasSiswa' => $kelasSiswa,
            'unreadCounts' => $unreadCounts,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
