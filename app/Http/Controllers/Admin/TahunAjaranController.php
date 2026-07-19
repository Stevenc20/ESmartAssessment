<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TahunAjaran;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class TahunAjaranController extends Controller
{
    public function index()
    {
        $data = TahunAjaran::withCount('kelas')->latest()->get();

        return Inertia::render('admin/tahun-ajaran/index', ['items' => $data]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tahun' => 'required|string|max:20|unique:tahun_ajaran,tahun',
            'status' => 'required|in:active,inactive',
        ]);

        if ($validated['status'] === 'active') {
            TahunAjaran::where('status', 'active')->update(['status' => 'inactive']);
        }

        TahunAjaran::create($validated);

        return back()->with('success', 'Tahun ajaran berhasil ditambahkan.');
    }

    public function update(Request $request, TahunAjaran $tahunAjaran)
    {
        $validated = $request->validate([
            'tahun' => ['required', 'string', 'max:20', Rule::unique('tahun_ajaran', 'tahun')->ignore($tahunAjaran->id)],
            'status' => 'required|in:active,inactive',
        ]);

        if ($validated['status'] === 'active') {
            TahunAjaran::where('status', 'active')->where('id', '!=', $tahunAjaran->id)->update(['status' => 'inactive']);
        }

        $tahunAjaran->update($validated);

        return back()->with('success', 'Tahun ajaran berhasil diperbarui.');
    }

    public function destroy(TahunAjaran $tahunAjaran)
    {
        if ($tahunAjaran->kelas()->count() > 0) {
            return back()->with('error', 'Tidak dapat menghapus tahun ajaran yang masih memiliki kelas.');
        }

        $tahunAjaran->delete();

        return back()->with('success', 'Tahun ajaran berhasil dihapus.');
    }
}
