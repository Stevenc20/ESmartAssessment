<?php

use App\Models\Kelas;
use App\Models\Role;
use App\Models\TahunAjaran;
use App\Models\User;

test('guru dapat mengakses halaman data siswa', function () {
    $guruRole = Role::firstOrCreate(['role_name' => 'guru']);
    $siswaRole = Role::firstOrCreate(['role_name' => 'siswa']);
    $ta = TahunAjaran::firstOrCreate(['tahun' => '2026/2027'], ['status' => 'active']);

    $guru = User::factory()->create([
        'role_id' => $guruRole->id,
        'status' => 'active',
    ]);

    $kelas = Kelas::create([
        'nama_kelas' => 'Genesis 10 RPL',
        'tingkat' => '10',
        'tahun_ajaran_id' => $ta->id,
    ]);

    $siswa = User::factory()->create([
        'name' => 'Siswa Test Satu',
        'email' => 'siswa.test1@gmail.com',
        'role_id' => $siswaRole->id,
        'kelas' => '10',
        'jurusan' => 'RPL_PPLG',
        'status' => 'active',
    ]);
    $siswa->kelas()->attach($kelas->id, ['tanggal_masuk' => now()->toDateString()]);

    $response = $this->actingAs($guru)->get('/guru/siswa');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('teacher/data-siswa/index')
        ->has('students')
        ->has('kelasList')
    );
});

test('guru dapat memperbarui data siswa termasuk gmail / email', function () {
    $guruRole = Role::firstOrCreate(['role_name' => 'guru']);
    $siswaRole = Role::firstOrCreate(['role_name' => 'siswa']);
    $ta = TahunAjaran::firstOrCreate(['tahun' => '2026/2027'], ['status' => 'active']);

    $guru = User::factory()->create([
        'role_id' => $guruRole->id,
        'status' => 'active',
    ]);

    $kelas = Kelas::create([
        'nama_kelas' => 'Genesis 10 RPL',
        'tingkat' => '10',
        'tahun_ajaran_id' => $ta->id,
    ]);

    $siswa = User::factory()->create([
        'name' => 'Nama Lama',
        'email' => 'email.lama@gmail.com',
        'no_hp' => '081234567890',
        'role_id' => $siswaRole->id,
        'kelas' => '10',
        'jurusan' => 'RPL_PPLG',
        'status' => 'active',
    ]);
    $siswa->kelas()->attach($kelas->id, ['tanggal_masuk' => now()->toDateString()]);

    $response = $this->actingAs($guru)->put("/guru/siswa/{$siswa->id}", [
        'name' => 'Nama Baru Siswa',
        'email' => 'email.baru.update@gmail.com',
        'no_hp' => '089876543210',
        'kelas_id' => $kelas->id,
        'jurusan' => 'DKV_1',
        'status' => 'active',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $siswa->refresh();
    expect($siswa->name)->toBe('Nama Baru Siswa');
    expect($siswa->email)->toBe('email.baru.update@gmail.com');
    expect($siswa->no_hp)->toBe('089876543210');
    expect($siswa->jurusan)->toBe('DKV_1');
});
