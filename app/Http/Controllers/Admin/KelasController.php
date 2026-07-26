<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Models\Role;
use App\Models\TahunAjaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class KelasController extends Controller
{
    public function index()
    {
        $data = Kelas::with('tahunAjaran')->latest()->get();
        $tahunAjaran = TahunAjaran::where('status', 'active')->orWhere(function ($q) {
            $q->whereHas('kelas');
        })->get();

        $siswaRoleId = Role::where('role_name', 'siswa')->first()?->id;
        $arabicMap = ['X' => '10', 'XI' => '11', 'XII' => '12'];

        if ($siswaRoleId) {
            foreach ($data as $kelas) {
                $tingkatValues = array_unique(array_filter([
                    $kelas->tingkat,
                    $arabicMap[$kelas->tingkat] ?? null,
                ]));

                $kelas->siswa_count = DB::table('users')
                    ->where('role_id', $siswaRoleId)
                    ->where('status', 'active')
                    ->whereIn('kelas', $tingkatValues)
                    ->count();
            }
        } else {
            foreach ($data as $kelas) {
                $kelas->siswa_count = 0;
            }
        }

        return Inertia::render('admin/kelas/index', [
            'items' => $data,
            'tahunAjaran' => $tahunAjaran,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_kelas' => 'required|string|max:100',
            'tingkat' => 'required|string|max:50',
            'tahun_ajaran_id' => 'required|exists:tahun_ajaran,id',
        ]);

        Kelas::create($validated);

        return back()->with('success', 'Kelas berhasil ditambahkan.');
    }

    public function update(Request $request, Kelas $kelas)
    {
        $validated = $request->validate([
            'nama_kelas' => 'required|string|max:100',
            'tingkat' => 'required|string|max:50',
            'tahun_ajaran_id' => 'required|exists:tahun_ajaran,id',
        ]);

        $kelas->update($validated);

        return back()->with('success', 'Kelas berhasil diperbarui.');
    }

    public function destroy(Kelas $kelas)
    {
        $arabicMap = ['X' => '10', 'XI' => '11', 'XII' => '12'];
        $tingkatValues = array_unique(array_filter([
            $kelas->tingkat,
            $arabicMap[$kelas->tingkat] ?? null,
        ]));

        $siswaRoleId = Role::where('role_name', 'siswa')->first()?->id;
        $hasSiswa = $siswaRoleId && DB::table('users')
            ->where('role_id', $siswaRoleId)
            ->whereIn('kelas', $tingkatValues)
            ->exists();

        if ($hasSiswa) {
            return back()->with('error', 'Tidak dapat menghapus kelas yang masih memiliki siswa.');
        }

        $kelas->delete();

        return back()->with('success', 'Kelas berhasil dihapus.');
    }
}
