<?php

namespace App\Http\Controllers;

use App\Models\Absensi;
use App\Models\Pertemuan;
use App\Models\Roadmap;
use App\Models\Role;
use App\Models\User;
use App\Services\AttendanceAlertService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LaporanController extends Controller
{
    public function absensi(Request $request)
    {
        $mode = $request->input('mode', 'bulan');
        $threshold = AttendanceAlertService::THRESHOLD;

        if ($mode === 'roadmap') {
            return $this->absensiRoadmap($request, $threshold);
        }

        return $this->absensiBulanan($request, $threshold);
    }

    private function absensiBulanan(Request $request, float $threshold)
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

        $data = $siswa->map(function ($s) use ($pertemuanIds, $totalPertemuan, $threshold) {
            $absensi = Absensi::where('siswa_id', $s->id)
                ->whereIn('pertemuan_id', $pertemuanIds)
                ->get()
                ->unique('pertemuan_id');

            $hadir = $absensi->where('status', 'hadir')->count();
            $terlambat = $absensi->where('status', 'terlambat')->count();
            $izin = $absensi->where('status', 'izin')->count();
            $sakit = $absensi->where('status', 'sakit')->count();
            $totalAbsensi = $hadir + $terlambat + $izin + $sakit;
            $tidakHadir = max(0, $totalPertemuan - $totalAbsensi);
            $pct = $totalPertemuan > 0 ? round(($totalAbsensi / $totalPertemuan) * 100) : 0;

            return [
                'siswa_id' => $s->id,
                'nama' => $s->name,
                'hadir' => $hadir,
                'terlambat' => $terlambat,
                'izin' => $izin,
                'sakit' => $sakit,
                'tidak_hadir' => $tidakHadir,
                'pct' => $pct,
                'below_threshold' => $totalPertemuan > 0 && $pct < $threshold,
            ];
        })->sortByDesc('tidak_hadir')->values();

        return Inertia::render('laporan/absensi', [
            'data' => $data,
            'total_pertemuan' => $totalPertemuan,
            'bulan' => $bulan,
            'tahun' => $tahun,
            'mode' => 'bulan',
            'threshold' => $threshold,
        ]);
    }

    private function absensiRoadmap(Request $request, float $threshold)
    {
        $roadmapId = (int) $request->input('roadmap_id', 0);

        $roadmaps = Roadmap::with(['pertemuan' => fn ($q) => $q->orderBy('urutan')])
            ->orderBy('tahun', 'desc')
            ->orderBy('bulan', 'desc')
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'judul' => $r->judul,
                'bulan' => $r->bulan,
                'tahun' => $r->tahun,
                'bulan_nama' => $this->bulanNama($r->bulan),
                'tingkat' => $r->tingkat,
                'total_pertemuan' => $r->pertemuan->count(),
                'published_pertemuan' => $r->pertemuan->where('status', 'published')->count(),
            ]);

        $roadmap = Roadmap::with(['pertemuan' => fn ($q) => $q->where('status', 'published')->orderBy('urutan')])
            ->find($roadmapId);

        if (! $roadmap) {
            return Inertia::render('laporan/absensi', [
                'data' => [],
                'total_pertemuan' => 0,
                'pertemuan_total' => 0,
                'bulan' => now()->month,
                'tahun' => now()->year,
                'mode' => 'roadmap',
                'roadmap_id' => 0,
                'roadmaps' => $roadmaps,
                'pertemuan' => [],
                'roadmap_judul' => null,
                'threshold' => $threshold,
            ]);
        }

        $pertemuan = $roadmap->pertemuan;
        $pertemuanIds = $pertemuan->pluck('id');
        $totalPertemuan = $pertemuan->count();

        $roleSiswa = Role::where('role_name', 'siswa')->first();
        $siswa = User::where('role_id', $roleSiswa?->id)
            ->where('status', 'active')
            ->orderBy('name')
            ->get();

        $absensi = Absensi::whereIn('pertemuan_id', $pertemuanIds)
            ->get()
            ->groupBy('siswa_id');

        $data = $siswa->map(function ($s) use ($absensi, $pertemuan, $totalPertemuan, $threshold) {
            $records = $absensi->get($s->id, collect())->keyBy('pertemuan_id');

            $statuses = $pertemuan->map(fn ($p) => $records->get($p->id)?->status ?? Absensi::STATUS_ALPA);

            $hadir = $statuses->where(fn ($st) => in_array($st, [
                Absensi::STATUS_HADIR,
                Absensi::STATUS_TERLAMBAT,
                Absensi::STATUS_IZIN,
                Absensi::STATUS_SAKIT,
            ], true))->count();
            $tidakHadir = $totalPertemuan - $hadir;
            $pct = $totalPertemuan > 0 ? round(($hadir / $totalPertemuan) * 100) : 0;

            return [
                'siswa_id' => $s->id,
                'nama' => $s->name,
                'statuses' => $statuses->mapWithKeys(fn ($st, $i) => [$pertemuan[$i]->id => $st])->toArray(),
                'tidak_hadir' => $tidakHadir,
                'pct' => $pct,
                'below_threshold' => $totalPertemuan > 0 && $pct < $threshold,
            ];
        })->sortByDesc('tidak_hadir')->values();

        return Inertia::render('laporan/absensi', [
            'data' => $data,
            'total_pertemuan' => $totalPertemuan,
            'pertemuan_total' => $roadmap->pertemuan()->count(),
            'bulan' => now()->month,
            'tahun' => now()->year,
            'mode' => 'roadmap',
            'roadmap_id' => $roadmap->id,
            'roadmaps' => $roadmaps,
            'pertemuan' => $pertemuan->map(fn ($p) => [
                'id' => $p->id,
                'judul' => $p->judul,
                'urutan' => $p->urutan,
                'tanggal' => $p->tanggal?->format('Y-m-d'),
            ])->values(),
            'roadmap_judul' => $roadmap->judul,
            'threshold' => $threshold,
        ]);
    }

    private function bulanNama(int $bulan): string
    {
        $nama = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ];

        return $nama[$bulan] ?? 'Unknown';
    }
}
