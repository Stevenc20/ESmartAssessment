<?php

use App\Models\Materi;
use App\Models\MateriFile;
use App\Models\Pertemuan;
use App\Models\Roadmap;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

function fileRole(string $name): Role
{
    return Role::where('role_name', $name)->first() ?? Role::create(['role_name' => $name]);
}

function fileUser(string $name, Role $role): User
{
    return User::create([
        'name' => $name,
        'email' => strtolower(str_replace(' ', '', $name)).'@test.test',
        'password' => 'password',
        'role_id' => $role->id,
        'status' => 'active',
    ]);
}

test('guru dapat membuat materi dengan file individual dan siswa dapat mendownload', function () {
    Storage::fake('public');

    $guru = fileUser('Guru File', fileRole('guru'));
    $siswa = fileUser('Siswa File', fileRole('siswa'));

    $roadmap = Roadmap::create([
        'judul' => 'Roadmap File',
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
        'judul' => 'Materi File',
        'files' => [
            UploadedFile::fake()->createWithContent('bahan.pdf', 'PDFCONTENT'),
            UploadedFile::fake()->create('slide.pptx', 20),
        ],
    ])->assertRedirect('/materi');

    $materi = Materi::where('judul', 'Materi File')->first();
    expect($materi)->not->toBeNull();

    $files = $materi->files;
    expect($files->count())->toBe(2);

    $bahan = $files->firstWhere('nama', 'bahan.pdf');
    expect($bahan->nama)->toBe('bahan.pdf');
    expect($bahan->size)->toBeGreaterThan(0);

    Storage::disk('public')->assertExists($bahan->path);

    $response = $this->actingAs($siswa)->get("/materi/files/{$bahan->id}/download")
        ->assertOk()
        ->assertHeader('Content-Disposition', 'attachment; filename=bahan.pdf');

    expect($response->streamedContent())->toBe('PDFCONTENT');
});

test('file dapat dihapus beserta file fisiknya', function () {
    Storage::fake('public');

    $guru = fileUser('Guru Hapus File', fileRole('guru'));

    $roadmap = Roadmap::create([
        'judul' => 'Roadmap Hapus File',
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
        'judul' => 'Materi Hapus File',
        'files' => [
            UploadedFile::fake()->create('bahan.pdf', 1),
        ],
    ])->assertRedirect('/materi');

    $file = MateriFile::first();
    expect($file)->not->toBeNull();
    $path = $file->path;

    $this->actingAs($guru)->delete("/materi/files/{$file->id}")
        ->assertSessionHas('success');

    expect(MateriFile::find($file->id))->toBeNull();
    Storage::disk('public')->assertMissing($path);
});
