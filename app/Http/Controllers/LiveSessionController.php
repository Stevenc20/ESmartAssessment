<?php

namespace App\Http\Controllers;

use App\Models\LiveSession;
use App\Models\Pertemuan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LiveSessionController extends Controller
{
    /**
     * Start a new live screen session for a Pertemuan.
     */
    public function start(Request $request, Pertemuan $pertemuan): JsonResponse
    {
        $user = $request->user();
        $userRole = strtolower($user->role?->role_name ?? '');

        // 1. Authorization: Only Guru, Pembina, Admin, Superadmin can start live screen
        if (! in_array($userRole, ['guru', 'pembina', 'admin', 'superadmin'])) {
            return response()->json([
                'message' => 'Anda tidak memiliki izin untuk membagikan layar pada pertemuan ini.',
            ], 403);
        }

        // 2. Normalize & validate optional Google Meet link
        $meetUrl = $this->normalizeMeetUrl($request->input('meet_url'));

        if ($request->has('meet_url') && $request->filled('meet_url') && $meetUrl === null) {
            return response()->json([
                'message' => 'Link Google Meet tidak valid. Gunakan link seperti https://meet.google.com/abc-defg-hij',
            ], 422);
        }

        // 3. Single active session rule: Check if an active session already exists for this meeting
        $existingSession = LiveSession::where('pertemuan_id', $pertemuan->id)
            ->where('status', 'live')
            ->first();

        if ($existingSession) {
            // If the host is the same user, reuse/return existing live session
            if ($existingSession->host_id === $user->id) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Sesi Live Screen sudah berjalan.',
                    'live_session' => [
                        'id' => $existingSession->id,
                        'room_name' => $existingSession->room_name,
                        'meet_url' => $existingSession->meet_url,
                        'host_name' => $existingSession->host?->name ?? 'Guru',
                        'status' => $existingSession->status,
                        'started_at' => $existingSession->started_at?->toIso8601String(),
                    ],
                ]);
            }

            return response()->json([
                'message' => 'Sesi Live Screen sedang digunakan oleh pengajar lain pada pertemuan ini.',
            ], 422);
        }

        // 4. Generate unique room_name for the session
        $roomName = 'esmart-live-p'.$pertemuan->id.'-'.Str::random(10);

        $session = LiveSession::create([
            'pertemuan_id' => $pertemuan->id,
            'host_id' => $user->id,
            'room_name' => $roomName,
            'meet_url' => $meetUrl,
            'status' => 'live',
            'started_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Live Screen berhasil dimulai.',
            'live_session' => [
                'id' => $session->id,
                'room_name' => $session->room_name,
                'meet_url' => $session->meet_url,
                'host_name' => $user->name,
                'status' => $session->status,
                'started_at' => $session->started_at?->toIso8601String(),
            ],
        ]);
    }

    /**
     * Normalize a Google Meet URL to its canonical form, stripping any tracking parameters.
     */
    private function normalizeMeetUrl(?string $url): ?string
    {
        $url = trim((string) $url);

        if ($url === '') {
            return null;
        }

        if (! preg_match('#^https?://(?:www\.)?meet\.google\.com/([a-z0-9]{3}-[a-z0-9]{3,4}-[a-z0-9]{3})#i', $url, $matches)) {
            return null;
        }

        return 'https://meet.google.com/'.strtolower($matches[1]);
    }

    /**
     * Stop active live screen session for a Pertemuan.
     */
    public function stop(Request $request, Pertemuan $pertemuan): JsonResponse
    {
        $user = $request->user();
        $userRole = strtolower($user->role?->role_name ?? '');

        if (! in_array($userRole, ['guru', 'pembina', 'admin', 'superadmin'])) {
            return response()->json([
                'message' => 'Anda tidak memiliki izin untuk menghentikan Live Screen.',
            ], 403);
        }

        $activeSession = LiveSession::where('pertemuan_id', $pertemuan->id)
            ->where('status', 'live')
            ->first();

        if (! $activeSession) {
            return response()->json([
                'status' => 'success',
                'message' => 'Sesi Live Screen sudah tidak aktif.',
            ]);
        }

        $activeSession->update([
            'status' => 'ended',
            'ended_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Live Screen telah dihentikan.',
        ]);
    }

    /**
     * Get active live screen session status for a Pertemuan.
     */
    public function status(Request $request, Pertemuan $pertemuan): JsonResponse
    {
        $activeSession = LiveSession::where('pertemuan_id', $pertemuan->id)
            ->where('status', 'live')
            ->with('host')
            ->first();

        if (! $activeSession) {
            return response()->json([
                'active' => false,
                'live_session' => null,
            ]);
        }

        return response()->json([
            'active' => true,
            'live_session' => [
                'id' => $activeSession->id,
                'room_name' => $activeSession->room_name,
                'meet_url' => $activeSession->meet_url,
                'host_id' => $activeSession->host_id,
                'host_name' => $activeSession->host?->name ?? 'Guru',
                'status' => $activeSession->status,
                'started_at' => $activeSession->started_at?->toIso8601String(),
            ],
        ]);
    }
}
