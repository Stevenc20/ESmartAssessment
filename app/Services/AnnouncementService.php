<?php

namespace App\Services;

use App\Models\Announcement;
use App\Models\GlobalAnnouncement;
use App\Models\Materi;
use App\Models\NotificationRead;
use App\Models\Tugas;
use App\Models\User;

class AnnouncementService
{
    /**
     * @return array<int, array{id:string, judul:string, isi:string, type:string, source:string, created_at:string}>
     */
    public function listForUser(User $user): array
    {
        $roleName = $user->role?->role_name;

        $regular = Announcement::where(function ($q) use ($roleName) {
            $q->whereNull('target_role')
                ->orWhere('target_role', '')
                ->orWhere('target_role', 'all')
                ->orWhere('target_role', $roleName);
        })
            ->where(fn ($q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
            ->where(fn ($q) => $q->whereNull('ends_at')->orWhere('ends_at', '>=', now()))
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
            ->where(fn ($q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
            ->where(fn ($q) => $q->whereNull('ends_at')->orWhere('ends_at', '>=', now()))
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

        return $regular->concat($global)
            ->sortByDesc('sort_at')
            ->values()
            ->map(fn ($a) => collect($a)->except('sort_at')->toArray())
            ->toArray();
    }

    /**
     * @return array{pengumuman:int, materi:int, assessment:int}
     */
    public function unreadCountsForUser(User $user): array
    {
        $roleName = $user->role?->role_name;

        $announcementIds = Announcement::where(function ($q) use ($roleName) {
            $q->whereNull('target_role')
                ->orWhere('target_role', '')
                ->orWhere('target_role', 'all')
                ->orWhere('target_role', $roleName);
        })
            ->where(fn ($q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
            ->where(fn ($q) => $q->whereNull('ends_at')->orWhere('ends_at', '>=', now()))
            ->pluck('id');

        $globalIds = GlobalAnnouncement::where('is_active', true)
            ->where(fn ($q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
            ->where(fn ($q) => $q->whereNull('ends_at')->orWhere('ends_at', '>=', now()))
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

        $unreadCounts = [
            'pengumuman' => $announcementIds->diff($readPengumuman)->count()
                + $globalIds->diff($readGlobal)->count(),
            'materi' => 0,
            'assessment' => 0,
        ];

        if ($roleName === 'siswa') {
            $kelas = $this->kelasForUser($user);
            $tingkat = $kelas?->tingkat;

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

        return $unreadCounts;
    }

    public function markAllRead(User $user): void
    {
        $roleName = $user->role?->role_name;

        $announcementIds = Announcement::where(function ($q) use ($roleName) {
            $q->whereNull('target_role')
                ->orWhere('target_role', '')
                ->orWhere('target_role', 'all')
                ->orWhere('target_role', $roleName);
        })
            ->where(fn ($q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
            ->where(fn ($q) => $q->whereNull('ends_at')->orWhere('ends_at', '>=', now()))
            ->pluck('id');

        $globalIds = GlobalAnnouncement::where('is_active', true)
            ->where(fn ($q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
            ->where(fn ($q) => $q->whereNull('ends_at')->orWhere('ends_at', '>=', now()))
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

        $unreadAnnouncementIds = $announcementIds->diff($readPengumuman);
        $unreadGlobalIds = $globalIds->diff($readGlobal);

        $now = now();
        $records = [];

        foreach ($unreadAnnouncementIds as $id) {
            $records[] = [
                'user_id' => $user->id,
                'notifiable_type' => Announcement::class,
                'notifiable_id' => $id,
                'read_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        foreach ($unreadGlobalIds as $id) {
            $records[] = [
                'user_id' => $user->id,
                'notifiable_type' => GlobalAnnouncement::class,
                'notifiable_id' => $id,
                'read_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if (! empty($records)) {
            NotificationRead::insert($records);
        }
    }

    public function kelasForUser(User $user)
    {
        return $user->kelas()
            ->whereNull('siswa_kelas.tanggal_keluar')
            ->first()
            ?? $user->kelas()->latest('siswa_kelas.tanggal_masuk')->first()
            ?? $user->kelas()->first();
    }
}
