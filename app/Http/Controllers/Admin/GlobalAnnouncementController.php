<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GlobalAnnouncement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GlobalAnnouncementController extends Controller
{
    public function index()
    {
        $announcements = GlobalAnnouncement::with('creator')
            ->latest()
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'judul' => $a->judul,
                'isi' => $a->isi,
                'type' => $a->type,
                'is_active' => $a->is_active,
                'starts_at' => $a->starts_at?->format('d M Y H:i'),
                'ends_at' => $a->ends_at?->format('d M Y H:i'),
                'created_by' => $a->creator?->name ?? '-',
                'created_at' => $a->created_at->diffForHumans(),
            ]);

        return Inertia::render('admin/global-announcements/index', ['announcements' => $announcements]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'isi' => 'required|string',
            'type' => 'required|in:info,warning,maintenance',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'target_role' => 'nullable|string',
        ]);

        $validated['created_by'] = $request->user()->id;
        $validated['is_active'] = true;

        GlobalAnnouncement::create($validated);

        return back()->with('success', 'Pengumuman global berhasil dibuat');
    }

    public function update(Request $request, GlobalAnnouncement $globalAnnouncement)
    {
        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'isi' => 'required|string',
            'type' => 'required|in:info,warning,maintenance',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'target_role' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $globalAnnouncement->update($validated);

        return back()->with('success', 'Pengumuman global berhasil diupdate');
    }

    public function destroy(GlobalAnnouncement $globalAnnouncement)
    {
        $globalAnnouncement->delete();
        return back()->with('success', 'Pengumuman global berhasil dihapus');
    }

    public function toggle(GlobalAnnouncement $globalAnnouncement)
    {
        $globalAnnouncement->update(['is_active' => !$globalAnnouncement->is_active]);
        return back()->with('success', 'Status pengumuman berhasil diubah');
    }
}
