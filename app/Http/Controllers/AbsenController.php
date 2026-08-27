<?php

namespace App\Http\Controllers;

use App\Models\Absensi;
use App\Models\GlobalAnnouncement;
use App\Models\Pertemuan;
use App\Models\QrSession;
use App\Models\Role;
use App\Models\User;
use App\Services\AttendanceAlertService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AbsenController extends Controller
{
    public function buka(Request $request, Pertemuan $pertemuan)
    {
        $active = QrSession::where('pertemuan_id', $pertemuan->id)
            ->where('status', 'active')
            ->where('expired_at', '>', now())
            ->first();

        if ($active) {
            $qrUrl = route('absen.scan', $active->token);

            $attendees = Absensi::where('pertemuan_id', $pertemuan->id)
                ->with('siswa:id,name')
                ->get()
                ->map(fn ($a) => [
                    'id' => $a->id,
                    'siswa_id' => $a->siswa_id,
                    'nama' => $a->siswa?->name,
                    'status' => $a->status,
                    'scan_time' => $a->scan_time?->format('H:i:s'),
                ]);

            return response()->json([
                'session' => $active,
                'qr_url' => $qrUrl,
                'attendees' => $attendees,
                'total_scanned' => $attendees->count(),
            ]);
        }

        $session = QrSession::create([
            'pertemuan_id' => $pertemuan->id,
            'token' => Str::random(64),
            'expired_at' => now()->addMinutes(10),
            'status' => 'active',
        ]);

        GlobalAnnouncement::create([
            'judul' => 'Absen Dibuka - '.$pertemuan->judul,
            'isi' => 'Absen untuk "'.$pertemuan->judul.'" telah dibuka. Silakan scan QR code untuk melakukan absensi.',
            'type' => 'info',
            'starts_at' => now(),
            'ends_at' => $session->expired_at,
            'is_active' => true,
            'target_role' => 'siswa',
            'created_by' => $request->user()->id,
        ]);

        Cache::increment('announcement_version');

        $qrUrl = route('absen.scan', $session->token);

        \App\Jobs\SendAnnouncementEmails::dispatch(
            'Absen Dibuka - '.$pertemuan->judul,
            'Absen untuk "'.$pertemuan->judul.'" telah dibuka. Silakan klik tombol di bawah untuk melakukan absensi.',
            'siswa',
            'info',
            'Absen Dibuka',
            $qrUrl
        );

        $attendees = Absensi::where('pertemuan_id', $pertemuan->id)
            ->with('siswa:id,name')
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'siswa_id' => $a->siswa_id,
                'nama' => $a->siswa?->name,
                'status' => $a->status,
                'scan_time' => $a->scan_time?->format('H:i:s'),
            ]);

        return response()->json([
            'session' => $session,
            'qr_url' => $qrUrl,
            'attendees' => $attendees,
            'total_scanned' => $attendees->count(),
        ]);
    }

    public function tutup(Request $request, Pertemuan $pertemuan)
    {
        $session = QrSession::where('pertemuan_id', $pertemuan->id)
            ->where('status', 'active')
            ->firstOrFail();

        $session->update(['status' => 'closed']);

        GlobalAnnouncement::where('judul', 'Absen Dibuka - '.$pertemuan->judul)
            ->where('is_active', true)
            ->update(['is_active' => false, 'ends_at' => now()]);

        Cache::increment('announcement_version');

        if ($pertemuan->roadmap_id) {
            app(AttendanceAlertService::class)->checkRoadmap($pertemuan->roadmap_id);
        }

        return response()->json(['status' => 'closed']);
    }

    public function status(Pertemuan $pertemuan)
    {
        $session = QrSession::where('pertemuan_id', $pertemuan->id)
            ->where('status', 'active')
            ->where('expired_at', '>', now())
            ->first();

        if (! $session) {
            return response()->json(['active' => false]);
        }

        $attendees = Absensi::where('pertemuan_id', $pertemuan->id)
            ->with('siswa:id,name')
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'siswa_id' => $a->siswa_id,
                'nama' => $a->siswa?->name,
                'status' => $a->status,
                'scan_time' => $a->scan_time?->format('H:i:s'),
            ]);

        return response()->json([
            'active' => true,
            'session' => [
                'id' => $session->id,
                'token' => $session->token,
                'expired_at' => $session->expired_at->toIso8601String(),
                'expires_in' => now()->diffInSeconds($session->expired_at, false),
            ],
            'attendees' => $attendees,
            'total_scanned' => $attendees->count(),
        ]);
    }

    public function scan($token)
    {
        $session = QrSession::where('token', $token)
            ->whereIn('status', ['active'])
            ->where('expired_at', '>', now())
            ->first();

        if (! $session) {
            return Inertia::render('absen/scan', [
                'status' => 'invalid',
                'message' => 'QR code tidak valid atau sudah kedaluwarsa.',
            ]);
        }

        if (! auth()->check()) {
            session()->put('url.intended', route('absen.scan', $token));

            return redirect()->route('login');
        }

        $existing = Absensi::where('pertemuan_id', $session->pertemuan_id)
            ->where('siswa_id', auth()->id())
            ->first();

        $pertemuanTitle = $session->pertemuan
            ? ($session->pertemuan->urutan ? 'Pertemuan '.$session->pertemuan->urutan.': '.$session->pertemuan->judul : $session->pertemuan->judul)
            : 'Pertemuan';

        $isTerlambat = now()->diffInMinutes($session->expired_at) <= 2;
        $newStatus = $isTerlambat ? 'terlambat' : 'hadir';

        if ($existing) {
            if (in_array($existing->status, ['alpa', 'tidak_hadir'])) {
                $existing->update([
                    'status' => $newStatus,
                    'qr_session_id' => $session->id,
                    'scan_time' => now(),
                ]);

                return Inertia::render('absen/scan', [
                    'status' => 'success',
                    'message' => 'Absensi berhasil diperbarui!',
                    'scan_time' => now()->format('d M Y H:i:s'),
                    'pertemuan' => $pertemuanTitle,
                ]);
            }

            return Inertia::render('absen/scan', [
                'status' => 'already',
                'message' => 'Anda sudah melakukan absensi untuk pertemuan ini.',
                'scan_time' => $existing->scan_time?->format('d M Y H:i:s'),
                'pertemuan' => $pertemuanTitle,
            ]);
        }

        Absensi::create([
            'siswa_id' => auth()->id(),
            'pertemuan_id' => $session->pertemuan_id,
            'qr_session_id' => $session->id,
            'status' => $newStatus,
            'scan_time' => now(),
        ]);

        return Inertia::render('absen/scan', [
            'status' => 'success',
            'message' => 'Absensi berhasil!',
            'scan_time' => now()->format('d M Y H:i:s'),
            'pertemuan' => $pertemuanTitle,
        ]);
    }

    public function rekap(Request $request, Pertemuan $pertemuan)
    {
        $this->authorizeGuru($request);

        $roleSiswa = Role::where('role_name', 'Siswa')->orWhere('role_name', 'siswa')->first();
        $siswa = User::where('role_id', $roleSiswa?->id)
            ->where('status', 'active')
            ->orderBy('name')
            ->get();

        $absensi = Absensi::where('pertemuan_id', $pertemuan->id)
            ->get()
            ->keyBy('siswa_id');

        $roster = $siswa->map(fn ($s) => [
            'siswa_id' => $s->id,
            'nama' => $s->name,
            'status' => $absensi->get($s->id)?->status ?? Absensi::STATUS_ALPA,
        ]);

        return response()->json([
            'pertemuan_id' => $pertemuan->id,
            'pertemuan' => $pertemuan->judul,
            'roster' => $roster,
            'total_siswa' => $roster->count(),
            'sudah_absen' => $absensi->count(),
        ]);
    }

    public function manual(Request $request, Pertemuan $pertemuan)
    {
        $this->authorizeGuru($request);

        $data = $request->validate([
            'status' => ['required', 'array'],
            'status.*' => ['required', 'in:'.implode(',', [
                Absensi::STATUS_HADIR,
                Absensi::STATUS_TERLAMBAT,
                Absensi::STATUS_IZIN,
                Absensi::STATUS_SAKIT,
                Absensi::STATUS_ALPA,
            ])],
        ]);

        $roleSiswa = Role::where('role_name', 'Siswa')->orWhere('role_name', 'siswa')->first();
        $validSiswaIds = User::where('role_id', $roleSiswa?->id)
            ->where('status', 'active')
            ->pluck('id')
            ->flip();

        $updated = 0;
        foreach ($data['status'] as $siswaId => $status) {
            if (! isset($validSiswaIds[$siswaId])) {
                continue;
            }

            Absensi::updateOrCreate(
                ['siswa_id' => $siswaId, 'pertemuan_id' => $pertemuan->id],
                ['status' => $status, 'qr_session_id' => null],
            );
            $updated++;
        }

        $sent = [];
        if ($pertemuan->roadmap_id) {
            $sent = app(AttendanceAlertService::class)->checkRoadmap($pertemuan->roadmap_id);
        }

        if ($request->hasHeader('X-Inertia')) {
            return back();
        }

        return response()->json([
            'success' => true,
            'updated' => $updated,
            'alerts_sent' => $sent,
        ]);
    }

    private function authorizeGuru(Request $request): void
    {
        if ($request->user()->role?->role_name !== 'guru') {
            abort(403, 'Hanya guru yang dapat mengelola absensi manual.');
        }
    }

    public function siswaIndex(Request $request)
    {
        $user = $request->user();
        $siswaId = $user->id;

        $allPertemuan = Pertemuan::where(function ($q) {
            $q->whereIn('status', ['published', 'completed'])
                ->orWhereHas('absensi');
        })
            ->with('roadmap')
            ->orderBy('urutan')
            ->get();
        $absensiRecords = Absensi::where('siswa_id', $siswaId)->get()->keyBy('pertemuan_id');

        $totalHadir = 0;
        $totalTerlambat = 0;
        $totalIzin = 0;
        $totalSakit = 0;
        $totalAlpa = 0;

        $riwayat = $allPertemuan->map(function ($p) use ($absensiRecords, &$totalHadir, &$totalTerlambat, &$totalIzin, &$totalSakit, &$totalAlpa) {
            $abs = $absensiRecords->get($p->id);

            if ($abs) {
                if ($abs->status === 'hadir') {
                    $totalHadir++;
                } elseif ($abs->status === 'terlambat') {
                    $totalTerlambat++;
                } elseif ($abs->status === 'izin') {
                    $totalIzin++;
                } elseif ($abs->status === 'sakit') {
                    $totalSakit++;
                } else {
                    $totalAlpa++;
                }

                return [
                    'id' => $abs->id,
                    'pertemuan_id' => $p->id,
                    'pertemuan' => $p->judul,
                    'roadmap' => $p->roadmap?->judul ?? '-',
                    'status' => $abs->status,
                    'scan_time' => $abs->scan_time ? $abs->scan_time->format('d M Y H:i') : '-',
                    'tanggal' => $p->tanggal ? $p->tanggal->format('d M Y') : '-',
                ];
            }

            $totalAlpa++;

            return [
                'id' => 'p-'.$p->id,
                'pertemuan_id' => $p->id,
                'pertemuan' => $p->judul,
                'roadmap' => $p->roadmap?->judul ?? '-',
                'status' => 'alpa',
                'scan_time' => '-',
                'tanggal' => $p->tanggal ? $p->tanggal->format('d M Y') : '-',
            ];
        });

        $activeSessions = $this->getActiveSessionsForSiswa($siswaId);

        return Inertia::render('absen/index', [
            'stats' => [
                'total' => $allPertemuan->count(),
                'hadir' => $totalHadir,
                'terlambat' => $totalTerlambat,
                'izin' => $totalIzin,
                'sakit' => $totalSakit,
                'alpa' => $totalAlpa,
            ],
            'riwayat' => $riwayat,
            'active_sessions' => $activeSessions,
        ]);
    }

    private function getActiveSessionsForSiswa($siswaId)
    {
        return QrSession::where('status', 'active')
            ->where('expired_at', '>', now())
            ->with('pertemuan')
            ->get()
            ->filter(fn ($s) => ! Absensi::where('qr_session_id', $s->id)
                ->where('siswa_id', $siswaId)
                ->exists())
            ->values()
            ->map(fn ($s) => [
                'pertemuan_id' => $s->pertemuan_id,
                'pertemuan' => $s->pertemuan?->judul ?? '-',
                'token' => $s->token,
                'expired_at' => $s->expired_at->toIso8601String(),
            ]);
    }

    public function sesiAktif(Request $request)
    {
        return response()->json(
            $this->getActiveSessionsForSiswa($request->user()->id)
        );
    }
}
