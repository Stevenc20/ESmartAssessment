<?php

namespace App\Http\Controllers;

use App\Models\Absensi;
use App\Models\Pertemuan;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LaporanController extends Controller
{
    public function absensi(Request $request)
    {
        $bulan = (int) $request->input('bulan', now()->month);
        $tahun = (int) $request->input('tahun', now()->year);

        $pertemuan = Pertemuan::where('status', 'published')
            ->where(function ($q) use ($bulan, $tahun) {
                $q->whereNull('tanggal')
                    ->orWhere(fn ($q2) => $q2->whereYear('tanggal', $tahun)->whereMonth('tanggal', $bulan));
            })
            ->orderBy('tanggal')
            ->get();

        $totalPertemuan = $pertemuan->count();
        $pertemuanIds = $pertemuan->pluck('id');

        $roleSiswa = Role::where('role_name', 'siswa')->first();
        $siswa = User::where('role_id', $roleSiswa?->id)
            ->where('status', 'active')
            ->orderBy('name')
            ->get();

        $data = $siswa->map(function ($s) use ($pertemuanIds, $totalPertemuan) {
            $absensi = Absensi::where('siswa_id', $s->id)
                ->whereIn('pertemuan_id', $pertemuanIds)
                ->get()
                ->unique('pertemuan_id');

            $hadir = $absensi->where('status', 'hadir')->count();
            $terlambat = $absensi->where('status', 'terlambat')->count();
            $totalAbsensi = $hadir + $terlambat;
            $tidakHadir = max(0, $totalPertemuan - $totalAbsensi);

            return [
                'siswa_id' => $s->id,
                'nama' => $s->name,
                'hadir' => $hadir,
                'terlambat' => $terlambat,
                'tidak_hadir' => $tidakHadir,
            ];
        })->sortByDesc('tidak_hadir')->values();

        return Inertia::render('laporan/absensi', [
            'data' => $data,
            'total_pertemuan' => $totalPertemuan,
            'bulan' => $bulan,
            'tahun' => $tahun,
        ]);
    }
}
