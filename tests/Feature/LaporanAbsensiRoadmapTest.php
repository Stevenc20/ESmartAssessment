<?php

use App\Models\Absensi;
use App\Models\Pertemuan;
use App\Models\Roadmap;
use App\Models\Role;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function laporanRole(string $name): Role
{
    $role = Role::where('role_name', $name)->first();

    return $role ?? Role::create(['role_name' => $name]);
}

function laporanSiswa(Role $role, string $name): User
{
    return User::create([
        'name' => $name,
        'email' => strtolower(str_replace(' ', '', $name)).'@test.test',
        'password' => 'password',
        'role_id' => $role->id,
        'status' => 'active',
    ]);
}

test('roadmap dengan pertemuan published menampilkan data siswa', function () {
    $role = laporanRole('siswa');
    $siswa = laporanSiswa($role, 'Siswa Satu');
    $guru = User::create([
        'name' => 'Guru Satu',
        'email' => 'gurusatu@test.test',
        'password' => 'password',
        'role_id' => laporanRole('guru')->id,
        'status' => 'active',
    ]);

    $roadmap = Roadmap::create([
        'judul' => 'Roadmap Agustus',
        'bulan' => 8,
        'tahun' => 2026,
        'tingkat' => '10',
        'created_by' => $guru->id,
    ]);

    $pertemuan = collect([1, 2, 3, 4])->map(fn ($i) => Pertemuan::create([
        'roadmap_id' => $roadmap->id,
        'judul' => "Pertemuan $i",
        'urutan' => $i,
        'tanggal' => now()->addDays($i),
        'status' => 'published',
    ]));

    Absensi::create([
        'siswa_id' => $siswa->id,
        'pertemuan_id' => $pertemuan[0]->id,
        'status' => 'hadir',
    ]);

    $this->actingAs($guru)->get(route('laporan.absensi').'?mode=roadmap&roadmap_id='.$roadmap->id)
        ->assertInertia(fn (Assert $page) => $page
            ->where('mode', 'roadmap')
            ->where('total_pertemuan', 4)
            ->where('pertemuan_total', 4)
            ->has('data', 1)
            ->has('pertemuan', 4)
        );
});

test('roadmap tanpa pertemuan published tidak menampilkan kolom pertemuan', function () {
    $role = laporanRole('siswa');
    laporanSiswa($role, 'Siswa Dua');
    $guru = User::create([
        'name' => 'Guru Dua',
        'email' => 'gurudua@test.test',
        'password' => 'password',
        'role_id' => laporanRole('guru')->id,
        'status' => 'active',
    ]);

    $roadmap = Roadmap::create([
        'judul' => 'Roadmap Draft',
        'bulan' => 7,
        'tahun' => 2026,
        'tingkat' => '11',
        'created_by' => $guru->id,
    ]);

    foreach (range(1, 4) as $i) {
        Pertemuan::create([
            'roadmap_id' => $roadmap->id,
            'judul' => "Pertemuan $i",
            'urutan' => $i,
            'status' => 'draft',
        ]);
    }

    $this->actingAs($guru)->get(route('laporan.absensi').'?mode=roadmap&roadmap_id='.$roadmap->id)
        ->assertInertia(fn (Assert $page) => $page
            ->where('total_pertemuan', 0)
            ->where('pertemuan_total', 4)
            ->has('pertemuan', 0)
        );
});

test('pertemuan draft yang sudah punya absensi tetap dihitung', function () {
    $role = laporanRole('siswa');
    $siswa = laporanSiswa($role, 'Siswa Tiga');
    $guru = User::create([
        'name' => 'Guru Tiga',
        'email' => 'gurutiga@test.test',
        'password' => 'password',
        'role_id' => laporanRole('guru')->id,
        'status' => 'active',
    ]);

    $roadmap = Roadmap::create([
        'judul' => 'Roadmap Hybrid',
        'bulan' => 7,
        'tahun' => 2026,
        'tingkat' => '12',
        'created_by' => $guru->id,
    ]);

    $pertemuan = collect([1, 2, 3, 4])->map(fn ($i) => Pertemuan::create([
        'roadmap_id' => $roadmap->id,
        'judul' => "Pertemuan $i",
        'urutan' => $i,
        'tanggal' => $i <= 2 ? now()->subMonth() : now(),
        'status' => 'draft',
    ]));

    Absensi::create([
        'siswa_id' => $siswa->id,
        'pertemuan_id' => $pertemuan[1]->id,
        'status' => 'hadir',
    ]);

    $this->actingAs($guru)->get(route('laporan.absensi').'?mode=roadmap&roadmap_id='.$roadmap->id)
        ->assertInertia(fn (Assert $page) => $page
            ->where('total_pertemuan', 1)
            ->where('pertemuan_total', 4)
            ->has('pertemuan', 1)
        );
});
