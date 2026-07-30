<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\GlobalAnnouncement;
use App\Models\NotificationRead;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PengumumanController extends Controller
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

        $list = $regular->concat($global)->sortByDesc('sort_at')->values()->map(fn ($a) => collect($a)->except('sort_at')->toArray())->toArray();

        $announcementIds = Announcement::where(function ($q) use ($roleName) {
            $q->whereNull('target_role')
                ->orWhere('target_role', '')
                ->orWhere('target_role', 'all')
                ->orWhere('target_role', $roleName);
        })->pluck('id');

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

        return Inertia::render('pengumuman/index', [
            'list' => $list,
        ]);
    }
}
