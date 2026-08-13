<?php

namespace App\Http\Controllers\Settings;

use App\Exceptions\DeviceLinkException;
use App\Http\Controllers\Controller;
use App\Models\UserDevice;
use App\Services\DeviceLinkService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DeviceController extends Controller
{
    public function __construct(
        protected DeviceLinkService $service,
    ) {}

    /**
     * Show the user's linked devices.
     */
    public function index(Request $request): Response
    {
        $devices = $request->user()
            ->devices()
            ->latest()
            ->get()
            ->map(fn (UserDevice $device) => [
                'id' => $device->id,
                'device_name' => $device->device_name,
                'browser' => $device->browser,
                'os' => $device->os,
                'last_active_at' => $device->last_active_at?->diffForHumans(),
                'revoked_at' => $device->revoked_at?->diffForHumans(),
                'is_active' => $device->isActive(),
            ])
            ->values();

        return Inertia::render('settings/devices', [
            'devices' => $devices,
        ]);
    }

    /**
     * Revoke a linked device.
     */
    public function destroy(Request $request, UserDevice $device): RedirectResponse
    {
        try {
            $this->service->revokeDevice($device, $request->user());

            Inertia::flash('toast', ['type' => 'success', 'message' => __('Perangkat berhasil diputuskan.')]);
        } catch (DeviceLinkException $e) {
            Inertia::flash('toast', ['type' => 'error', 'message' => $e->getMessage()]);
        }

        return back();
    }
}
