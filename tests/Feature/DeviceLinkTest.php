<?php

use App\Models\DeviceLinkRequest;
use App\Models\User;
use App\Models\UserDevice;
use App\Services\DeviceLinkService;
use Illuminate\Foundation\Testing\TestCase;
use Illuminate\Support\Facades\Auth;

const DEVICE_LINK_TEST_SESSION = 'abcdefghij0123456789abcdefghij0123456789';
const DEVICE_LINK_OTHER_SESSION = 'mnopqrstuv0123456789mnopqrstuv0123456789';

/**
 * Create a pairing request through the HTTP route while pinning the session id
 * via an encrypted cookie so status/consume calls later in the same test hit
 * the same "browser".
 */
function pairingRequest(TestCase $test, string $sessionId = DEVICE_LINK_TEST_SESSION): array
{
    $test->withCredentials(true);
    $test->withCookie(config('session.cookie'), $sessionId);

    $response = $test->postJson(route('device-link.create'));

    $response->assertOk();

    return $response->json('data');
}

test('create pairing request returns random token and hashed token', function () {
    $data = pairingRequest($this);

    expect($data['request_id'])->toBeInt();
    expect(strlen($data['token']))->toBeGreaterThan(30);

    $model = DeviceLinkRequest::find($data['request_id']);

    expect($model->status)->toBe(DeviceLinkRequest::STATUS_PENDING);
    expect($model->token_hash)->toBe(hash('sha256', $data['token']));
    expect($model->token_hash)->not->toBe($data['token']);

    $payload = json_decode($data['payload'], true);

    expect($payload['type'])->toBe(DeviceLinkService::QR_TYPE);
    expect($payload['token'])->toBe($data['token']);
});

test('tokens are random and unique across requests', function () {
    $first = pairingRequest($this);
    $second = pairingRequest($this);

    expect($first['token'])->not->toBe($second['token']);
});

test('expired token cannot be scanned', function () {
    $data = pairingRequest($this);
    $model = DeviceLinkRequest::find($data['request_id']);
    $model->update(['expires_at' => now()->subMinute()]);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson(route('device-link.scan'), ['token' => $data['token']])
        ->assertStatus(422)
        ->assertJson(['error' => 'QR Code telah kedaluwarsa.']);
});

test('token cannot be used twice', function () {
    $data = pairingRequest($this);
    $model = DeviceLinkRequest::find($data['request_id']);
    $model->update(['status' => DeviceLinkRequest::STATUS_CONSUMED]);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson(route('device-link.scan'), ['token' => $data['token']])
        ->assertStatus(422)
        ->assertJson(['error' => 'QR Code sudah tidak dapat digunakan.']);
});

test('guest cannot scan or approve', function () {
    $data = pairingRequest($this);

    $this->postJson(route('device-link.scan'), ['token' => $data['token']])
        ->assertRedirect(route('login'));

    $this->postJson(route('device-link.approve', $data['request_id']))
        ->assertRedirect(route('login'));
});

test('authenticated user can scan a pending token', function () {
    $data = pairingRequest($this);
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson(route('device-link.scan'), ['token' => $data['token']])
        ->assertOk()
        ->assertJsonPath('data.id', $data['request_id']);

    $model = DeviceLinkRequest::find($data['request_id']);

    expect($model->status)->toBe(DeviceLinkRequest::STATUS_SCANNED);
    expect($model->user_id)->toBe($user->id);
});

test('user who rejected pairing does not authenticate the computer', function () {
    $data = pairingRequest($this);
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson(route('device-link.scan'), ['token' => $data['token']])
        ->assertOk();

    $this->actingAs($user)
        ->postJson(route('device-link.cancel', $data['request_id']))
        ->assertOk();

    $model = DeviceLinkRequest::find($data['request_id']);

    expect($model->status)->toBe(DeviceLinkRequest::STATUS_CANCELLED);

    Auth::forgetGuards();

    $this->postJson(route('device-link.consume', $data['request_id']))
        ->assertStatus(422);
});

test('approve then consume authenticates the guest browser', function () {
    $data = pairingRequest($this);
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson(route('device-link.scan'), ['token' => $data['token']])
        ->assertOk();

    $this->actingAs($user)
        ->postJson(route('device-link.approve', $data['request_id']))
        ->assertOk();

    $model = DeviceLinkRequest::find($data['request_id']);
    expect($model->status)->toBe(DeviceLinkRequest::STATUS_APPROVED);

    // Forget the actingAs guard so the guest browser truly starts logged-out.
    Auth::forgetGuards();

    $this->postJson(route('device-link.consume', $data['request_id']))
        ->assertOk()
        ->assertJsonPath('data.status', 'authenticated');

    $model->refresh();
    expect($model->status)->toBe(DeviceLinkRequest::STATUS_CONSUMED);
    expect($model->consumed_at)->not->toBeNull();

    $this->assertAuthenticatedAs($user);

    expect(UserDevice::where('user_id', $user->id)->count())->toBe(1);
});

test('different session cannot consume another pairing request', function () {
    $data = pairingRequest($this);
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson(route('device-link.scan'), ['token' => $data['token']])
        ->assertOk();

    $this->actingAs($user)
        ->postJson(route('device-link.approve', $data['request_id']))
        ->assertOk();

    Auth::forgetGuards();

    $this->withCookie(config('session.cookie'), DEVICE_LINK_OTHER_SESSION);

    $this->postJson(route('device-link.consume', $data['request_id']))
        ->assertStatus(403);

    expect(Auth::check())->toBeFalse();
});

test('pending pairing request cannot be consumed', function () {
    $data = pairingRequest($this);

    $this->postJson(route('device-link.consume', $data['request_id']))
        ->assertStatus(422)
        ->assertJson(['error' => 'Koneksi perangkat tidak dapat diselesaikan.']);
});

test('cancelled pairing request cannot be used', function () {
    $data = pairingRequest($this);
    DeviceLinkRequest::find($data['request_id'])->update([
        'status' => DeviceLinkRequest::STATUS_CANCELLED,
    ]);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson(route('device-link.scan'), ['token' => $data['token']])
        ->assertStatus(422);
});

test('another user cannot approve a pairing request', function () {
    $data = pairingRequest($this);
    $scanner = User::factory()->create();
    $intruder = User::factory()->create();

    $this->actingAs($scanner)
        ->postJson(route('device-link.scan'), ['token' => $data['token']])
        ->assertOk();

    $this->actingAs($intruder)
        ->postJson(route('device-link.approve', $data['request_id']))
        ->assertStatus(403);

    $model = DeviceLinkRequest::find($data['request_id']);
    expect($model->status)->toBe(DeviceLinkRequest::STATUS_SCANNED);
});

test('status endpoint is private to the creating session', function () {
    $data = pairingRequest($this);

    $this->withCookie(config('session.cookie'), DEVICE_LINK_OTHER_SESSION);

    $this->getJson(route('device-link.status', $data['request_id']))
        ->assertStatus(404);
});

test('create endpoint is rate limited', function () {
    pairingRequest($this);

    for ($i = 0; $i < 4; $i++) {
        $this->postJson(route('device-link.create'))->assertOk();
    }

    $this->postJson(route('device-link.create'))->assertStatus(429);
});

test('creating a new pairing cancels the previous pending one', function () {
    $first = pairingRequest($this);
    $second = pairingRequest($this);

    expect(DeviceLinkRequest::find($first['request_id'])->status)->toBe(DeviceLinkRequest::STATUS_CANCELLED);
    expect(DeviceLinkRequest::find($second['request_id'])->status)->toBe(DeviceLinkRequest::STATUS_PENDING);
});
