<?php

namespace App\Http\Controllers;

use App\Models\Absensi;
use App\Models\GlobalAnnouncement;
use App\Models\Pertemuan;
use App\Models\QrSession;
use Illuminate\Http\Request;
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

        $qrUrl = route('absen.scan', $session->token);

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

    public function tutup(Pertemuan $pertemuan)
    {
        $session = QrSession::where('pertemuan_id', $pertemuan->id)
            ->where('status', 'active')
            ->firstOrFail();

        $session->update(['status' => 'closed']);

        GlobalAnnouncement::where('judul', 'Absen Dibuka - '.$pertemuan->judul)
            ->where('is_active', true)
            ->update(['is_active' => false, 'ends_at' => now()]);

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
                'expired_at' => $session->expired_at->format('Y-m-d H:i:s'),
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

        if ($existing) {
            return Inertia::render('absen/scan', [
                'status' => 'already',
                'message' => 'Anda sudah melakukan absensi.',
                'scan_time' => $existing->scan_time?->format('d M Y H:i:s'),
                'pertemuan' => $session->pertemuan?->judul ?? 'Pertemuan',
            ]);
        }

        $isTerlambat = now()->diffInMinutes($session->expired_at) <= 2;

        Absensi::create([
            'siswa_id' => auth()->id(),
            'pertemuan_id' => $session->pertemuan_id,
            'qr_session_id' => $session->id,
            'status' => $isTerlambat ? 'terlambat' : 'hadir',
            'scan_time' => now(),
        ]);

        return Inertia::render('absen/scan', [
            'status' => 'success',
            'message' => 'Absensi berhasil!',
            'scan_time' => now()->format('d M Y H:i:s'),
            'pertemuan' => $session->pertemuan?->judul ?? 'Pertemuan',
        ]);
    }

    public function siswaIndex(Request $request)
    {
        $user = $request->user();
        $siswaId = $user->id;

        $totalHadir = Absensi::where('siswa_id', $siswaId)->where('status', 'hadir')->count();
        $totalTerlambat = Absensi::where('siswa_id', $siswaId)->where('status', 'terlambat')->count();
        $totalAbsen = Absensi::where('siswa_id', $siswaId)->count();

        $riwayat = Absensi::where('siswa_id', $siswaId)
            ->with('pertemuan.roadmap')
            ->latest()
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'pertemuan' => $a->pertemuan?->judul ?? '-',
                'roadmap' => $a->pertemuan?->roadmap?->judul ?? '-',
                'status' => $a->status,
                'scan_time' => $a->scan_time?->format('d M Y H:i'),
                'tanggal' => $a->pertemuan?->tanggal?->format('d M Y') ?? '-',
            ]);

        $activeSessions = $this->getActiveSessionsForSiswa($siswaId);

        return Inertia::render('absen/index', [
            'stats' => [
                'total' => $totalAbsen,
                'hadir' => $totalHadir,
                'terlambat' => $totalTerlambat,
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
                'expired_at' => $s->expired_at->format('Y-m-d H:i:s'),
            ]);
    }

    public function sesiAktif(Request $request)
    {
        return response()->json(
            $this->getActiveSessionsForSiswa($request->user()->id)
        );
    }
}
