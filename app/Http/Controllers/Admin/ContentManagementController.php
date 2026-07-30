<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Badge;
use App\Models\Materi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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
            'conditions' => $b->conditions,
            'total_penerima' => $b->siswa_count,
            'created_at' => $b->created_at->diffForHumans(),
        ]);

        $materiKategori = Materi::select('judul')
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
            'conditions' => 'nullable|array',
            'conditions.type' => 'nullable|string|in:assessment_count,assessment_avg_score,assessment_perfect,points_earned',
            'conditions.operator' => 'nullable|string|in:>=,>,<,<=,==',
            'conditions.value' => 'nullable',
        ]);

        if (! $request->filled('conditions.type')) {
            $validated['conditions'] = null;
        }

        Badge::create($validated);

        Cache::increment('badge_version');

        return back()->with('success', 'Badge berhasil dibuat');
    }

    public function updateBadge(Request $request, Badge $badge)
    {
        $validated = $request->validate([
            'badge_name' => 'required|string|max:255',
            'icon' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'conditions' => 'nullable|array',
            'conditions.type' => 'nullable|string|in:assessment_count,assessment_avg_score,assessment_perfect,points_earned',
            'conditions.operator' => 'nullable|string|in:>=,>,<,<=,==',
            'conditions.value' => 'nullable',
        ]);

        if (! $request->filled('conditions.type')) {
            $validated['conditions'] = null;
        }

        $badge->update($validated);

        Cache::increment('badge_version');

        return back()->with('success', 'Badge berhasil diupdate');
    }

    public function destroyBadge(Badge $badge)
    {
        $badge->delete();

        return back()->with('success', 'Badge berhasil dihapus');
    }
}
