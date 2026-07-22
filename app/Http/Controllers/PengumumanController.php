<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\GlobalAnnouncement;
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

        return Inertia::render('pengumuman/index', [
            'list' => $list,
        ]);
    }
}
