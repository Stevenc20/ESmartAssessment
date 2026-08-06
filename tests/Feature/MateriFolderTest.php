<?php

use App\Models\Materi;
use App\Models\MateriFolder;
use App\Models\Pertemuan;
use App\Models\Roadmap;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

function folderRole(string $name): Role
{
    return Role::where('role_name', $name)->first() ?? Role::create(['role_name' => $name]);
}

function folderUser(string $name, Role $role): User
{
    return User::create([
        'name' => $name,
        'email' => strtolower(str_replace(' ', '', $name)).'@test.test',
        'password' => 'password',
        'role_id' => $role->id,
        'status' => 'active',
    ]);
}

test('guru dapat membuat materi dengan folder dan siswa dapat mendownload zip', function () {
    Storage::fake('public');

    $guru = folderUser('Guru Folder', folderRole('guru'));
    $siswa = folderUser('Siswa Folder', folderRole('siswa'));

    $roadmap = Roadmap::create([
        'judul' => 'Roadmap Aplikasi',
        'bulan' => 8,
        'tahun' => 2026,
        'tingkat' => '10',
        'created_by' => $guru->id,
    ]);

    $pertemuan = Pertemuan::create([
        'roadmap_id' => $roadmap->id,
        'judul' => 'Pertemuan 1',
        'urutan' => 1,
        'status' => 'published',
    ]);

    $this->actingAs($guru)->post('/materi', [
        'pertemuan_id' => $pertemuan->id,
        'judul' => 'Materi Aplikasi',
        'deskripsi' => 'Fullstack project',
        'folders' => [
            [
                'nama' => 'Aplikasi',
                'files' => [
                    UploadedFile::fake()->create('main.js', 10),
                    UploadedFile::fake()->create('README.md', 5),
                ],
                'names' => [
                    'Aplikasi/src/main.js',
                    'Aplikasi/README.md',
                ],
            ],
            [
                'nama' => 'Project',
                'files' => [
                    UploadedFile::fake()->create('app.php', 20),
                ],
                'names' => [
                    'Project/config/app.php',
                ],
            ],
        ],
    ])->assertRedirect('/materi');

    $materi = Materi::where('judul', 'Materi Aplikasi')->first();
    expect($materi)->not->toBeNull();

    $folders = $materi->folders;
    expect($folders->count())->toBe(2);

    $appFolder = $folders->firstWhere('nama', 'Aplikasi');
    expect($appFolder->file_count)->toBe(2);
    expect($appFolder->total_size)->toBeGreaterThan(0);

    Storage::disk('public')->assertExists("materi-folders/{$appFolder->id}/Aplikasi/src/main.js");
    Storage::disk('public')->assertExists("materi-folders/{$appFolder->id}/Aplikasi/README.md");

    $this->actingAs($siswa)->get("/materi/folders/{$appFolder->id}/download")
        ->assertOk()
        ->assertHeader('Content-Type', 'application/zip')
        ->assertHeader('Content-Disposition', 'attachment; filename=Aplikasi.zip');
});

test('folder dapat dihapus beserta file-nya', function () {
    Storage::fake('public');

    $guru = folderUser('Guru Hapus', folderRole('guru'));

    $roadmap = Roadmap::create([
        'judul' => 'Roadmap Hapus',
        'bulan' => 8,
        'tahun' => 2026,
        'tingkat' => '10',
        'created_by' => $guru->id,
    ]);

    $pertemuan = Pertemuan::create([
        'roadmap_id' => $roadmap->id,
        'judul' => 'Pertemuan 1',
        'urutan' => 1,
        'status' => 'published',
    ]);

    $this->actingAs($guru)->post('/materi', [
        'pertemuan_id' => $pertemuan->id,
        'judul' => 'Materi Hapus',
        'folders' => [
            [
                'nama' => 'Aplikasi',
                'files' => [
                    UploadedFile::fake()->create('main.js', 1),
                ],
                'names' => [
                    'Aplikasi/main.js',
                ],
            ],
        ],
    ])->assertRedirect('/materi');

    $folder = MateriFolder::first();
    expect($folder)->not->toBeNull();

    $this->actingAs($guru)->delete("/materi/folders/{$folder->id}")
        ->assertSessionHas('success');

    expect(MateriFolder::find($folder->id))->toBeNull();
    Storage::disk('public')->assertMissing("materi-folders/{$folder->id}");
});
