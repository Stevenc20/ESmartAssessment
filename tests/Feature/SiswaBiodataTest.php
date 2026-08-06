<?php

use App\Models\Kelas;
use App\Models\Role;
use App\Models\TahunAjaran;
use App\Models\User;

function biodataRole(string $name): Role
{
    return Role::where('role_name', $name)->first() ?? Role::create(['role_name' => $name]);
}

function biodataTahunAjaran(): TahunAjaran
{
    return TahunAjaran::create(['tahun' => '2026/2027', 'status' => 'active']);
}

function biodataUser(string $name, Role $role): User
{
    return User::create([
        'name' => $name,
        'email' => strtolower(str_replace(' ', '', $name)).'@test.test',
        'password' => 'password',
        'role_id' => $role->id,
        'status' => 'active',
    ]);
}

function biodataKelas(string $namaKelas, string $tingkat): Kelas
{
    return Kelas::create([
        'nama_kelas' => $namaKelas,
        'tingkat' => $tingkat,
        'tahun_ajaran_id' => biodataTahunAjaran()->id,
    ]);
}

test('guru dapat memperbarui kelas dan jurusan siswa', function () {
    $guru = biodataUser('Guru Biodata', biodataRole('guru'));
    $siswa = biodataUser('Siswa Biodata', biodataRole('siswa'));
    $kelasLama = biodataKelas('X RPL', '10');
    $kelasBaru = biodataKelas('XI RPL', '11');

    $siswa->update(['kelas' => '10', 'jurusan' => 'RPL_PPLG']);
    $siswa->kelas()->attach($kelasLama->id, ['tanggal_masuk' => now()->toDateString()]);

    $response = $this->actingAs($guru)->put("/penilaian-materi/siswa/{$siswa->id}/biodata", [
        'kelas_id' => $kelasBaru->id,
        'jurusan' => 'DKV_1',
    ]);

    $response->assertRedirect();

    $siswa->refresh();
    expect($siswa->kelas)->toBe('11');
    expect($siswa->jurusan)->toBe('DKV_1');

    expect($siswa->kelas()->whereNull('siswa_kelas.tanggal_keluar')->first()->id)->toBe($kelasBaru->id);
    expect($siswa->kelas()->wherePivot('tanggal_keluar', null)->wherePivot('tanggal_masuk', '!=', null)->count())->toBe(1);
});

test('update biodata menolak kelas_id yang tidak valid', function () {
    $guru = biodataUser('Guru Biodata 2', biodataRole('guru'));
    $siswa = biodataUser('Siswa Biodata 2', biodataRole('siswa'));

    $response = $this->actingAs($guru)->put("/penilaian-materi/siswa/{$siswa->id}/biodata", [
        'kelas_id' => 999999,
        'jurusan' => 'AKL',
    ]);

    $response->assertSessionHasErrors('kelas_id');
});

test('siswa tidak dapat memperbarui biodata siswa lain', function () {
    $siswaPenyerang = biodataUser('Siswa Serang', biodataRole('siswa'));
    $siswa = biodataUser('Siswa Target', biodataRole('siswa'));
    $kelas = biodataKelas('X RPL', '10');

    $response = $this->actingAs($siswaPenyerang)->put("/penilaian-materi/siswa/{$siswa->id}/biodata", [
        'kelas_id' => $kelas->id,
        'jurusan' => 'AKL',
    ]);

    $response->assertForbidden();
});
