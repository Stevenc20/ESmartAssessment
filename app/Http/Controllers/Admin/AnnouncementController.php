<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    public function index()
    {
        $data = Announcement::with('creator')->latest()->get();
        $roles = Role::all();

        return Inertia::render('admin/announcements/index', [
            'items' => $data,
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'isi' => 'required|string',
            'target_role' => 'nullable|string|max:50',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
        ]);

        $validated['created_by'] = auth()->id();

        Announcement::create($validated);

        Cache::increment('announcement_version');

        app(\App\Services\AnnouncementService::class)->sendEmailNotifications(
            $validated['judul'],
            $validated['isi'],
            $validated['target_role'] ?? 'all',
            'info',
            'Pengumuman'
        );

        return back()->with('success', 'Pengumuman berhasil ditambahkan.');
    }

    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'isi' => 'required|string',
            'target_role' => 'nullable|string|max:50',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
        ]);

        $announcement->update($validated);

        Cache::increment('announcement_version');

        return back()->with('success', 'Pengumuman berhasil diperbarui.');
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();

        Cache::increment('announcement_version');

        return back()->with('success', 'Pengumuman berhasil dihapus.');
    }
}
