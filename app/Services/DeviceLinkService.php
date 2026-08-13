<?php

namespace App\Services;

use App\Exceptions\DeviceLinkException;
use App\Models\DeviceLinkRequest;
use App\Models\User;
use App\Models\UserDevice;
use App\Models\UserLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DeviceLinkService
{
    public const TTL_SECONDS = 90;

    public const QR_TYPE = 'esmart-device-link';

    /**
     * Create a new pairing request for a guest browser.
     *
     * @return array{request_id: int, token: string, expires_at: string, payload: string}
     */
    public function createPairingRequest(Request $request): array
    {
        $this->expirePairingRequests();

        $sessionHash = $this->hash($request->session()->getId());

        $this->cancelActiveForSession($sessionHash);

        $token = $this->generateToken();
        $expiresAt = now()->addSeconds(self::TTL_SECONDS);

        $model = DeviceLinkRequest::create([
            'token_hash' => $this->hash($token),
            'client_session_id_hash' => $sessionHash,
            'status' => DeviceLinkRequest::STATUS_PENDING,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'expires_at' => $expiresAt,
        ]);

        return [
            'request_id' => $model->id,
            'token' => $token,
            'expires_at' => $expiresAt->toIso8601String(),
            'payload' => json_encode([
                'type' => self::QR_TYPE,
                'token' => $token,
                'expires_at' => $expiresAt->toIso8601String(),
            ], JSON_THROW_ON_ERROR),
        ];
    }

    /**
     * Validate a scanned token. Throws when the token is invalid, expired, or already used.
     */
    public function validatePairingToken(string $token): DeviceLinkRequest
    {
        $this->expirePairingRequests();

        $model = DeviceLinkRequest::where('token_hash', $this->hash($token))->first();

        if (! $model) {
            throw new DeviceLinkException('QR Code tidak valid.', 404);
        }

        if ($model->isExpired()) {
            $this->markExpired($model);

            throw new DeviceLinkException('QR Code telah kedaluwarsa.');
        }

        if ($model->status !== DeviceLinkRequest::STATUS_PENDING) {
            throw new DeviceLinkException('QR Code sudah tidak dapat digunakan.');
        }

        return $model;
    }

    /**
     * Scan a pairing request from an authenticated (HP) user.
     */
    public function scanPairingRequest(string $token, User $user): DeviceLinkRequest
    {
        $model = $this->validatePairingToken($token);

        $model->update([
            'user_id' => $user->id,
            'status' => DeviceLinkRequest::STATUS_SCANNED,
        ]);

        return $model;
    }

    /**
     * Approve a scanned pairing request from the scanning (HP) user.
     */
    public function approvePairingRequest(DeviceLinkRequest $model, User $user): void
    {
        $this->expirePairingRequests();

        if ($model->status !== DeviceLinkRequest::STATUS_SCANNED) {
            throw new DeviceLinkException('Perangkat belum menunggu konfirmasi.');
        }

        if ($model->user_id !== $user->id) {
            throw new DeviceLinkException('Anda tidak dapat menyetujui QR Code ini.', 403);
        }

        if ($model->isExpired()) {
            $this->markExpired($model);

            throw new DeviceLinkException('QR Code telah kedaluwarsa.');
        }

        $model->update(['status' => DeviceLinkRequest::STATUS_APPROVED]);

        UserLog::create([
            'user_id' => $user->id,
            'activity' => 'Menyetujui koneksi perangkat via Link Device',
            'ip_address' => request()->ip(),
        ]);
    }

    /**
     * Cancel a pairing request. Must be initiated by the owner user (HP) when set.
     */
    public function cancelPairingRequest(DeviceLinkRequest $model, ?User $user = null): void
    {
        if ($user && $model->user_id && $model->user_id !== $user->id) {
            throw new DeviceLinkException('Anda tidak dapat membatalkan QR Code ini.', 403);
        }

        if (! $model->isTerminal()) {
            $model->update(['status' => DeviceLinkRequest::STATUS_CANCELLED]);
        }
    }

    /**
     * Consume an approved pairing request from the browser that created it.
     * Logs the user in and registers the new device.
     */
    public function consumePairingRequest(DeviceLinkRequest $model, Request $request): User
    {
        $this->expirePairingRequests();

        $sessionHash = $this->hash($request->session()->getId());

        if ($model->status !== DeviceLinkRequest::STATUS_APPROVED) {
            throw new DeviceLinkException('Koneksi perangkat tidak dapat diselesaikan.');
        }

        if ($model->client_session_id_hash !== $sessionHash) {
            throw new DeviceLinkException('QR Code tidak valid untuk browser ini.', 403);
        }

        $user = $model->user;

        if (! $user) {
            throw new DeviceLinkException('Akun tidak ditemukan.', 404);
        }

        $deviceInfo = $this->describeDevice($model->user_agent);

        DB::transaction(function () use ($model, $user, $request, $deviceInfo) {
            $model->update([
                'status' => DeviceLinkRequest::STATUS_CONSUMED,
                'consumed_at' => now(),
            ]);

            Auth::login($user);

            $request->session()->regenerate();

            UserDevice::create([
                'user_id' => $user->id,
                'client_session_id' => $request->session()->getId(),
                'device_name' => $this->deviceName($deviceInfo),
                'browser' => $deviceInfo['browser'],
                'os' => $deviceInfo['os'],
                'ip_address' => $request->ip(),
                'last_active_at' => now(),
            ]);

            UserLog::create([
                'user_id' => $user->id,
                'activity' => 'Perangkat terhubung via Link Device',
                'ip_address' => $request->ip(),
            ]);
        });

        return $user;
    }

    /**
     * Mark all pending/scanned requests whose expiry has passed as expired.
     */
    public function expirePairingRequests(): void
    {
        DeviceLinkRequest::whereIn('status', [
            DeviceLinkRequest::STATUS_PENDING,
            DeviceLinkRequest::STATUS_SCANNED,
        ])
            ->where('expires_at', '<', now())
            ->update(['status' => DeviceLinkRequest::STATUS_EXPIRED]);
    }

    /**
     * Revoke a linked device: invalidate its Laravel session and mark it revoked.
     */
    public function revokeDevice(UserDevice $device, User $user): void
    {
        if ($device->user_id !== $user->id) {
            throw new DeviceLinkException('Perangkat tidak ditemukan.', 404);
        }

        if (! $device->isActive()) {
            throw new DeviceLinkException('Perangkat sudah tidak terhubung.');
        }

        if ($device->client_session_id) {
            DB::table('sessions')->where('id', $device->client_session_id)->delete();
        }

        $device->update(['revoked_at' => now()]);

        UserLog::create([
            'user_id' => $user->id,
            'activity' => 'Memutuskan perangkat: '.($device->device_name ?: 'Perangkat'),
            'ip_address' => request()->ip(),
        ]);
    }

    /**
     * Cancel all active (pending/scanned) requests belonging to a session hash.
     */
    protected function cancelActiveForSession(string $sessionHash): void
    {
        DeviceLinkRequest::where('client_session_id_hash', $sessionHash)
            ->whereIn('status', [
                DeviceLinkRequest::STATUS_PENDING,
                DeviceLinkRequest::STATUS_SCANNED,
            ])
            ->update(['status' => DeviceLinkRequest::STATUS_CANCELLED]);
    }

    protected function markExpired(DeviceLinkRequest $model): void
    {
        if (! $model->isTerminal()) {
            $model->update(['status' => DeviceLinkRequest::STATUS_EXPIRED]);
        }
    }

    protected function generateToken(): string
    {
        return rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
    }

    protected function hash(string $value): string
    {
        return hash('sha256', $value);
    }

    protected function describeDevice(?string $ua): array
    {
        $browser = 'Peramban';
        $os = 'Sistem Operasi';

        if ($ua) {
            if (preg_match('/Edg\/([\d.]+)/i', $ua)) {
                $browser = 'Microsoft Edge';
            } elseif (preg_match('/OPR\/([\d.]+)/i', $ua)) {
                $browser = 'Opera';
            } elseif (preg_match('/Chrome\/([\d.]+)/i', $ua)) {
                $browser = 'Chrome';
            } elseif (preg_match('/Firefox\/([\d.]+)/i', $ua)) {
                $browser = 'Firefox';
            } elseif (preg_match('/Safari\/([\d.]+)/i', $ua)) {
                $browser = 'Safari';
            }

            if (preg_match('/Windows/i', $ua)) {
                $os = 'Windows';
            } elseif (preg_match('/Android/i', $ua)) {
                $os = 'Android';
            } elseif (preg_match('/iPhone|iPad|iOS/i', $ua)) {
                $os = 'iOS';
            } elseif (preg_match('/Mac OS X/i', $ua)) {
                $os = 'macOS';
            } elseif (preg_match('/Linux/i', $ua)) {
                $os = 'Linux';
            }
        }

        return ['browser' => $browser, 'os' => $os];
    }

    protected function deviceName(array $info): string
    {
        return $info['browser'].' · '.$info['os'];
    }
}
