<?php

use App\Models\User;
use App\Models\UserDevice;
use Illuminate\Support\Facades\DB;

function makeLinkedDevice(User $user, string $sessionId = 'computer-session-A'): UserDevice
{
    $device = UserDevice::create([
        'user_id' => $user->id,
        'client_session_id' => $sessionId,
        'device_name' => 'Chrome · Windows',
        'browser' => 'Chrome',
        'os' => 'Windows',
        'ip_address' => '127.0.0.1',
        'last_active_at' => now(),
    ]);

    DB::table('sessions')->insert([
        'id' => $sessionId,
        'user_id' => $user->id,
        'ip_address' => '127.0.0.1',
        'user_agent' => 'Mozilla/5.0',
        'payload' => base64_encode('test'),
        'last_activity' => now()->timestamp,
    ]);

    return $device;
}

test('guests are redirected from settings devices', function () {
    $this->get(route('devices.edit'))
        ->assertRedirect(route('login'));
});

test('settings devices page lists linked devices', function () {
    $user = User::factory()->create();
    $device = makeLinkedDevice($user);

    $this->actingAs($user)
        ->get(route('devices.edit'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('settings/devices')
            ->has('devices', 1)
            ->where('devices.0.id', $device->id)
            ->where('devices.0.is_active', true));
});

test('user can revoke a linked device', function () {
    $user = User::factory()->create();
    $device = makeLinkedDevice($user);

    $this->actingAs($user)
        ->delete(route('devices.destroy', $device))
        ->assertRedirect();

    $device->refresh();

    expect($device->revoked_at)->not->toBeNull();
    expect($device->isActive())->toBeFalse();
    expect(DB::table('sessions')->where('id', 'computer-session-A')->exists())->toBeFalse();
});

test('user cannot revoke another users device', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $device = makeLinkedDevice($owner);

    $this->actingAs($intruder)
        ->delete(route('devices.destroy', $device))
        ->assertRedirect();

    $device->refresh();

    expect($device->revoked_at)->toBeNull();
    expect(DB::table('sessions')->where('id', 'computer-session-A')->exists())->toBeTrue();
});

test('revoking an already revoked device errors gracefully', function () {
    $user = User::factory()->create();
    $device = makeLinkedDevice($user);
    $device->update(['revoked_at' => now()->subDay()]);

    $this->actingAs($user)
        ->delete(route('devices.destroy', $device))
        ->assertRedirect();
});

test('multiple linked devices are listed for the owner', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();

    makeLinkedDevice($user, 'session-A');
    makeLinkedDevice($user, 'session-B');
    makeLinkedDevice($other, 'session-other');

    $this->actingAs($user)
        ->get(route('devices.edit'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('settings/devices')
            ->has('devices', 2));
});
