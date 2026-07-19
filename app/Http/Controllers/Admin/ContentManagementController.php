<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Badge;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContentManagementController extends Controller
{
    public function index()
    {
        $badges = Badge::withCount('siswa')->latest()->get()->map(fn ($b) => [
            'id' => $b->id,
            'badge_name' => $b->badge_name,
            'icon' => $b->icon,
            'description' => $b->description,
            'total_penerima' => $b->siswa_count,
            'created_at' => $b->created_at->diffForHumans(),
        ]);

        $materiKategori = \App\Models\Materi::select('judul')
            ->distinct()
            ->get()
            ->groupBy(function ($m) {
                $parts = explode(' ', $m->judul);
                return $parts[0] ?? 'Lainnya';
            })
            ->keys();

        return Inertia::render('admin/content-management/index', [
            'badges' => $badges,
            'materiKategori' => $materiKategori,
        ]);
    }

    public function storeBadge(Request $request)
    {
        $validated = $request->validate([
            'badge_name' => 'required|string|max:255',
            'icon' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        Badge::create($validated);

        return back()->with('success', 'Badge berhasil dibuat');
    }

    public function updateBadge(Request $request, Badge $badge)
    {
        $validated = $request->validate([
            'badge_name' => 'required|string|max:255',
            'icon' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $badge->update($validated);

        return back()->with('success', 'Badge berhasil diupdate');
    }

    public function destroyBadge(Badge $badge)
    {
        $badge->delete();
        return back()->with('success', 'Badge berhasil dihapus');
    }
}
