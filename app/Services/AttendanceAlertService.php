<?php

namespace App\Services;

use App\Mail\AttendanceAlertMail;
use App\Models\Absensi;
use App\Models\AttendanceAlert;
use App\Models\Pertemuan;
use App\Models\Roadmap;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class AttendanceAlertService
{
    public const THRESHOLD = 75;

    /**
     * Cek kehadiran seluruh siswa pada sebuah roadmap dan kirim email
     * (sekali saja per siswa per roadmap) jika di bawah threshold.
     *
     * @return array<int, array{siswa_id:int, nama:string, persentase:float}>
     */
    public function checkRoadmap(int $roadmapId, ?array $siswaIds = null): array
    {
        $roadmap = Roadmap::find($roadmapId);
        if (! $roadmap) {
            return [];
        }

        $pertemuanIds = Pertemuan::where('roadmap_id', $roadmapId)
            ->where('status', 'published')
            ->pluck('id');

        $total = $pertemuanIds->count();
        if ($total === 0) {
            return [];
        }

        $roleSiswa = Role::where('role_name', 'siswa')->first();
        $siswa = User::where('role_id', $roleSiswa?->id)
            ->where('status', 'active')
            ->when($siswaIds, fn ($q) => $q->whereIn('id', $siswaIds))
            ->get();

        $absensi = Absensi::whereIn('pertemuan_id', $pertemuanIds)
            ->whereIn('siswa_id', $siswa->pluck('id'))
            ->get()
            ->groupBy('siswa_id');

        $existingAlerts = AttendanceAlert::where('roadmap_id', $roadmapId)
            ->pluck('siswa_id')
            ->flip();

        $sent = [];

        foreach ($siswa as $s) {
            $records = $absensi->get($s->id, collect());
            $hadir = $records->whereIn('status', [
                Absensi::STATUS_HADIR,
                Absensi::STATUS_TERLAMBAT,
                Absensi::STATUS_IZIN,
                Absensi::STATUS_SAKIT,
            ])->count();

            $persentase = round(($hadir / $total) * 100, 2);

            if ($persentase >= self::THRESHOLD) {
                continue;
            }

            if (isset($existingAlerts[$s->id])) {
                continue;
            }

            Mail::to($s->email)->queue(new AttendanceAlertMail($s, $roadmap, $persentase, self::THRESHOLD));

            AttendanceAlert::create([
                'siswa_id' => $s->id,
                'roadmap_id' => $roadmapId,
                'persentase' => $persentase,
                'sent_at' => now(),
            ]);

            $sent[] = [
                'siswa_id' => $s->id,
                'nama' => $s->name,
                'persentase' => $persentase,
            ];
        }

        return $sent;
    }

    /**
     * Daftar siswa yang kehadirannya di bawah threshold pada roadmap mana pun.
     *
     * @return array<int, array{siswa_id:int, nama:string, persentase:float, roadmap_id:int, roadmap_judul:string}>
     */
    public function studentsBelowThreshold(?int $limit = 100): array
    {
        $roleSiswa = Role::where('role_name', 'siswa')->first();
        $siswa = User::where('role_id', $roleSiswa?->id)
            ->where('status', 'active')
            ->get();

        $roadmaps = Roadmap::with(['pertemuan' => fn ($q) => $q->where('status', 'published')])
            ->orderBy('tahun', 'desc')
            ->orderBy('bulan', 'desc')
            ->get()
            ->filter(fn ($r) => $r->pertemuan->isNotEmpty());

        $alerts = [];
        $best = [];

        foreach ($roadmaps as $roadmap) {
            $pertemuanIds = $roadmap->pertemuan->pluck('id');
            $total = $pertemuanIds->count();

            $absensi = Absensi::whereIn('pertemuan_id', $pertemuanIds)
                ->get()
                ->groupBy('siswa_id');

            foreach ($siswa as $s) {
                $hadir = $absensi->get($s->id, collect())->whereIn('status', [
                    Absensi::STATUS_HADIR,
                    Absensi::STATUS_TERLAMBAT,
                    Absensi::STATUS_IZIN,
                    Absensi::STATUS_SAKIT,
                ])->count();

                $persentase = round(($hadir / $total) * 100, 2);

                if ($persentase >= self::THRESHOLD) {
                    continue;
                }

                if (isset($best[$s->id])) {
                    if ($persentase >= $best[$s->id]) {
                        continue;
                    }
                    $best[$s->id] = $persentase;
                } else {
                    $best[$s->id] = $persentase;
                }

                $alerts[$s->id] = [
                    'siswa_id' => $s->id,
                    'nama' => $s->name,
                    'persentase' => $persentase,
                    'roadmap_id' => $roadmap->id,
                    'roadmap_judul' => $roadmap->judul,
                ];
            }
        }

        return collect($alerts)
            ->sortByDesc('persentase')
            ->take($limit)
            ->values()
            ->all();
    }
}
