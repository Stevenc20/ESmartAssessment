<?php

namespace App\Http\Middleware;

use App\Models\Announcement;
use App\Models\GlobalAnnouncement;
use App\Models\Materi;
use App\Models\NotificationRead;
use App\Models\SystemSetting;
use App\Models\Tugas;
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

            $roleName = $user->role?->role_name;

            if ($roleName === 'siswa') {
                $kelas = $user->kelas()
                    ->whereNull('siswa_kelas.tanggal_keluar')
                    ->first()
                    ?? $user->kelas()->latest('siswa_kelas.tanggal_masuk')->first();
                if (! $kelas) {
                    $kelas = $user->kelas()->first();
                }
                if ($kelas) {
                    $kelasSiswa = [
                        'id' => $kelas->id,
                        'nama_kelas' => $kelas->nama_kelas,
                        'tingkat' => $kelas->tingkat,
                    ];
                }
            }

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

            $announcementIds = Announcement::where(function ($q) use ($roleName) {
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
                ->pluck('id');

            $globalIds = GlobalAnnouncement::where('is_active', true)
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
                })->pluck('id');

            $readIds = NotificationRead::where('user_id', $user->id)
                ->get()
                ->groupBy('notifiable_type');

            $readPengumuman = isset($readIds[Announcement::class])
                ? $readIds[Announcement::class]->pluck('notifiable_id')->toArray()
                : [];
            $readGlobal = isset($readIds[GlobalAnnouncement::class])
                ? $readIds[GlobalAnnouncement::class]->pluck('notifiable_id')->toArray()
                : [];

            $unreadCounts['pengumuman'] = $announcementIds->diff($readPengumuman)->count()
                + $globalIds->diff($readGlobal)->count();

            if ($roleName === 'siswa' && $kelasSiswa) {
                $tingkat = $kelasSiswa['tingkat'];

                $materiIds = Materi::where(function ($q) use ($tingkat) {
                    if ($tingkat) {
                        $q->where('tingkat', $tingkat)->orWhereNull('tingkat');
                    }
                })->pluck('id');

                $readMateriIds = isset($readIds[Materi::class])
                    ? $readIds[Materi::class]->pluck('notifiable_id')->toArray()
                    : [];

                $unreadCounts['materi'] = $materiIds->diff($readMateriIds)->count();

                $tugasIds = Tugas::whereHas('materi', function ($q) use ($tingkat) {
                    if ($tingkat) {
                        $q->where('tingkat', $tingkat)->orWhereNull('tingkat');
                    }
                })->pluck('id');

                $readTugasIds = isset($readIds[Tugas::class])
                    ? $readIds[Tugas::class]->pluck('notifiable_id')->toArray()
                    : [];

                $unreadCounts['assessment'] = $tugasIds->diff($readTugasIds)->count();
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
