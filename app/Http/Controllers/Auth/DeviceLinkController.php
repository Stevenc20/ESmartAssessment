<?php

namespace App\Http\Controllers\Auth;

use App\Exceptions\DeviceLinkException;
use App\Http\Controllers\Controller;
use App\Models\DeviceLinkRequest;
use App\Services\DeviceLinkService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DeviceLinkController extends Controller
{
    public function __construct(
        protected DeviceLinkService $service,
    ) {}

    /**
     * Show the "Link Device" pairing page for a guest browser (school computer).
     */
    public function show(Request $request): Response
    {
        return Inertia::render('auth/device-link');
    }

    /**
     * Create a new pairing request and return the QR payload.
     */
    public function create(Request $request): JsonResponse
    {
        $data = $this->service->createPairingRequest($request);

        return response()->json(['data' => $data]);
    }

    /**
     * Poll the pairing request status from the guest browser.
     */
    public function status(Request $request, DeviceLinkRequest $deviceLinkRequest): JsonResponse
    {
        $this->service->expirePairingRequests();

        $sessionHash = hash('sha256', $request->session()->getId());

        if ($deviceLinkRequest->client_session_id_hash !== $sessionHash) {
            return response()->json(['error' => 'Pairing request tidak ditemukan.'], 404);
        }

        return response()->json([
            'data' => [
                'id' => $deviceLinkRequest->id,
                'status' => $deviceLinkRequest->status,
                'expires_at' => $deviceLinkRequest->expires_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Validate and scan a QR token from an authenticated (HP) user.
     */
    public function scan(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
        ]);

        try {
            $model = $this->service->scanPairingRequest($validated['token'], $request->user());

            return response()->json([
                'data' => [
                    'id' => $model->id,
                    'expires_at' => $model->expires_at->toIso8601String(),
                    'device' => $this->deviceSummary($model),
                ],
            ]);
        } catch (DeviceLinkException $e) {
            return response()->json(['error' => $e->getMessage()], $e->statusCode());
        }
    }

    /**
     * Approve a scanned pairing request from the HP confirmation dialog.
     */
    public function approve(Request $request, DeviceLinkRequest $deviceLinkRequest): JsonResponse
    {
        try {
            $this->service->approvePairingRequest($deviceLinkRequest, $request->user());

            return response()->json(['data' => ['status' => 'approved']]);
        } catch (DeviceLinkException $e) {
            return response()->json(['error' => $e->getMessage()], $e->statusCode());
        }
    }

    /**
     * Cancel a pairing request (from HP or the guest browser).
     */
    public function cancel(Request $request, DeviceLinkRequest $deviceLinkRequest): JsonResponse
    {
        try {
            $this->service->cancelPairingRequest($deviceLinkRequest, $request->user());

            return response()->json(['data' => ['status' => 'cancelled']]);
        } catch (DeviceLinkException $e) {
            return response()->json(['error' => $e->getMessage()], $e->statusCode());
        }
    }

    /**
     * Consume an approved pairing request from the browser that created it.
     */
    public function consume(Request $request, DeviceLinkRequest $deviceLinkRequest): JsonResponse
    {
        try {
            $user = $this->service->consumePairingRequest($deviceLinkRequest, $request);

            return response()->json([
                'data' => [
                    'status' => 'authenticated',
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                    ],
                ],
            ]);
        } catch (DeviceLinkException $e) {
            return response()->json(['error' => $e->getMessage()], $e->statusCode());
        }
    }

    protected function deviceSummary(DeviceLinkRequest $model): array
    {
        $ua = $model->user_agent;

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
}
