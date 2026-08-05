<?php

use App\Mail\AttendanceAlertMail;
use App\Models\Absensi;
use App\Models\AttendanceAlert;
use App\Models\Pertemuan;
use App\Models\Roadmap;
use App\Models\Role;
use App\Models\User;
use App\Services\AttendanceAlertService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

function absenRole(string $name): Role
{
    return Role::create(['role_name' => $name, 'description' => $name]);
}

function absenUser(Role $role, string $name): User
{
    $user = User::create([
        'name' => $name,
        'email' => strtolower(str_replace(' ', '', $name)).'@test.test',
        'password' => 'password',
        'role_id' => $role->id,
        'status' => 'active',
    ]);
    $user->email_verified_at = now();
    $user->save();

    return $user;
}

function absenRoadmap(User $creator, array $statuses = ['published', 'published', 'published', 'published']): array
{
    $roadmap = Roadmap::create([
        'judul' => 'Roadmap Agustus 2026',
        'bulan' => 8,
        'tahun' => 2026,
        'created_by' => $creator->id,
    ]);

    $pertemuan = [];
    foreach ($statuses as $i => $status) {
        $pertemuan[] = Pertemuan::create([
            'roadmap_id' => $roadmap->id,
            'judul' => 'Pertemuan '.($i + 1),
            'urutan' => $i + 1,
            'status' => $status,
        ]);
    }

    return [$roadmap, $pertemuan];
}

test('guru dapat melihat roster absensi manual pada sebuah pertemuan', function () {
    $guruRole = absenRole('guru');
    $siswaRole = absenRole('siswa');
    $guru = absenUser($guruRole, 'Guru Satu');
    $siswa = absenUser($siswaRole, 'Siswa Satu');

    [$roadmap, $pertemuan] = absenRoadmap($guru);
    Absensi::create(['siswa_id' => $siswa->id, 'pertemuan_id' => $pertemuan[0]->id, 'qr_session_id' => null, 'status' => 'hadir']);

    $this->actingAs($guru)
        ->getJson(route('pertemuan.absen.rekap', $pertemuan[0]))
        ->assertOk()
        ->assertJsonPath('pertemuan', 'Pertemuan 1')
        ->assertJsonPath('roster.0.siswa_id', $siswa->id)
        ->assertJsonPath('roster.0.status', 'hadir');
});

test('guru dapat mengubah status absensi siswa secara manual', function () {
    $guruRole = absenRole('guru');
    $siswaRole = absenRole('siswa');
    $guru = absenUser($guruRole, 'Guru Dua');
    $siswa = absenUser($siswaRole, 'Siswa Dua');

    [$roadmap, $pertemuan] = absenRoadmap($guru);

    $this->actingAs($guru)
        ->postJson(route('pertemuan.absen.manual', $pertemuan[0]), [
            'status' => [$siswa->id => 'izin'],
        ])
        ->assertOk()
        ->assertJsonPath('updated', 1);

    $this->assertDatabaseHas('absensi', [
        'siswa_id' => $siswa->id,
        'pertemuan_id' => $pertemuan[0]->id,
        'status' => 'izin',
    ]);
});

test('siswa tidak dapat mengelola absensi manual', function () {
    $siswaRole = absenRole('siswa');
    $siswa = absenUser($siswaRole, 'Siswa Tiga');
    $guruRole = absenRole('guru');
    $guru = absenUser($guruRole, 'Guru Tiga');

    [$roadmap, $pertemuan] = absenRoadmap($guru);

    $this->actingAs($siswa)
        ->postJson(route('pertemuan.absen.manual', $pertemuan[0]), [
            'status' => [$siswa->id => 'hadir'],
        ])
        ->assertForbidden();

    $this->assertDatabaseMissing('absensi', ['siswa_id' => $siswa->id]);
});

test('email peringatan kehadiran dikirim sekali saja saat di bawah threshold', function () {
    Mail::fake();

    $guruRole = absenRole('guru');
    $siswaRole = absenRole('siswa');
    $guru = absenUser($guruRole, 'Guru Empat');
    $siswa = absenUser($siswaRole, 'Siswa Empat');

    [$roadmap, $pertemuan] = absenRoadmap($guru);

    Absensi::create(['siswa_id' => $siswa->id, 'pertemuan_id' => $pertemuan[0]->id, 'qr_session_id' => null, 'status' => 'hadir']);

    $sent = app(AttendanceAlertService::class)->checkRoadmap($roadmap->id);

    expect($sent)->toHaveCount(1);
    expect($sent[0]['siswa_id'])->toBe($siswa->id);
    expect($sent[0]['persentase'])->toBe(25.0);

    Mail::assertQueued(AttendanceAlertMail::class, 1);

    $this->assertDatabaseHas('attendance_alerts', [
        'siswa_id' => $siswa->id,
        'roadmap_id' => $roadmap->id,
        'persentase' => 25.0,
    ]);

    $sentAgain = app(AttendanceAlertService::class)->checkRoadmap($roadmap->id);

    expect($sentAgain)->toHaveCount(0);
    Mail::assertQueued(AttendanceAlertMail::class, 1);
});

test('izin dan sakit dihitung sebagai hadir untuk persentase kehadiran', function () {
    $guruRole = absenRole('guru');
    $siswaRole = absenRole('siswa');
    $guru = absenUser($guruRole, 'Guru Lima');
    $siswa = absenUser($siswaRole, 'Siswa Lima');

    [$roadmap, $pertemuan] = absenRoadmap($guru);

    Absensi::create(['siswa_id' => $siswa->id, 'pertemuan_id' => $pertemuan[0]->id, 'qr_session_id' => null, 'status' => 'hadir']);
    Absensi::create(['siswa_id' => $siswa->id, 'pertemuan_id' => $pertemuan[1]->id, 'qr_session_id' => null, 'status' => 'izin']);
    Absensi::create(['siswa_id' => $siswa->id, 'pertemuan_id' => $pertemuan[2]->id, 'qr_session_id' => null, 'status' => 'sakit']);

    $sent = app(AttendanceAlertService::class)->checkRoadmap($roadmap->id);

    expect($sent)->toHaveCount(0);
    expect(AttendanceAlert::count())->toBe(0);
});

test('laporan absensi mode roadmap mengembalikan matrix status per pertemuan', function () {
    $guruRole = absenRole('guru');
    $siswaRole = absenRole('siswa');
    $guru = absenUser($guruRole, 'Guru Enam');
    $siswa = absenUser($siswaRole, 'Siswa Enam');

    [$roadmap, $pertemuan] = absenRoadmap($guru);

    Absensi::create(['siswa_id' => $siswa->id, 'pertemuan_id' => $pertemuan[0]->id, 'qr_session_id' => null, 'status' => 'sakit']);

    $this->actingAs($guru)
        ->get(route('laporan.absensi', ['mode' => 'roadmap', 'roadmap_id' => $roadmap->id]))
        ->assertOk();
});
