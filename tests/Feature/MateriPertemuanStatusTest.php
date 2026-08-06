<?php

use App\Models\Materi;
use App\Models\Pertemuan;
use App\Models\Roadmap;
use App\Models\Role;
use App\Models\User;

function pertemuanStatusRole(string $name): Role
{
    return Role::where('role_name', $name)->first() ?? Role::create(['role_name' => $name]);
}

function pertemuanStatusUser(string $name, Role $role): User
{
    return User::create([
        'name' => $name,
        'email' => strtolower(str_replace(' ', '', $name)).'@test.test',
        'password' => 'password',
        'role_id' => $role->id,
        'status' => 'active',
    ]);
}

function pertemuanStatusRoadmap(User $guru, string $judul): Roadmap
{
    return Roadmap::create([
        'judul' => $judul,
        'bulan' => 8,
        'tahun' => 2026,
        'created_by' => $guru->id,
    ]);
}

test('siswa melihat materi dari pertemuan published dan completed', function () {
    $guru = pertemuanStatusUser('Guru Status', pertemuanStatusRole('guru'));
    $siswa = pertemuanStatusUser('Siswa Status', pertemuanStatusRole('siswa'));

    $roadmap = pertemuanStatusRoadmap($guru, 'Roadmap Status');

    $urutan = 1;
    foreach (['published' => 'Materi Published', 'completed' => 'Materi Completed'] as $status => $judul) {
        $pertemuan = Pertemuan::create([
            'roadmap_id' => $roadmap->id,
            'judul' => 'Pertemuan '.$status,
            'urutan' => $urutan++,
            'status' => $status,
        ]);

        Materi::create([
            'pertemuan_id' => $pertemuan->id,
            'judul' => $judul,
            'created_by' => $guru->id,
        ]);
    }

    $this->actingAs($siswa)
        ->get('/materi-saya')
        ->assertOk()
        ->assertSee('Materi Published')
        ->assertSee('Materi Completed');
});

test('siswa tidak melihat materi dari pertemuan draft', function () {
    $guru = pertemuanStatusUser('Guru Draft', pertemuanStatusRole('guru'));
    $siswa = pertemuanStatusUser('Siswa Draft', pertemuanStatusRole('siswa'));

    $roadmap = pertemuanStatusRoadmap($guru, 'Roadmap Draft');

    $pertemuan = Pertemuan::create([
        'roadmap_id' => $roadmap->id,
        'judul' => 'Pertemuan Draft',
        'urutan' => 1,
        'status' => 'draft',
    ]);

    Materi::create([
        'pertemuan_id' => $pertemuan->id,
        'judul' => 'Materi Draft',
        'created_by' => $guru->id,
    ]);

    $this->actingAs($siswa)
        ->get('/materi-saya')
        ->assertOk()
        ->assertDontSee('Materi Draft');
});
