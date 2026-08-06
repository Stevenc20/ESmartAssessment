<?php

use App\Models\Materi;
use App\Models\MateriDiscussion;
use App\Models\Pertemuan;
use App\Models\Roadmap;
use App\Models\Role;
use App\Models\User;

function forumRole(string $name): Role
{
    return Role::where('role_name', $name)->first() ?? Role::create(['role_name' => $name]);
}

function forumUser(string $name, Role $role): User
{
    return User::create([
        'name' => $name,
        'email' => strtolower(str_replace(' ', '', $name)).'@test.test',
        'password' => 'password',
        'role_id' => $role->id,
        'status' => 'active',
    ]);
}

function forumMateri(User $guru): Materi
{
    $roadmap = Roadmap::create([
        'judul' => 'Roadmap Forum',
        'bulan' => 8,
        'tahun' => 2026,
        'created_by' => $guru->id,
    ]);

    $pertemuan = Pertemuan::create([
        'roadmap_id' => $roadmap->id,
        'judul' => 'Pertemuan Forum',
        'urutan' => 1,
        'status' => 'published',
    ]);

    return Materi::create([
        'pertemuan_id' => $pertemuan->id,
        'judul' => 'Materi Forum',
        'created_by' => $guru->id,
    ]);
}

test('siswa dapat membalas diskusi dan reply tersimpan sebagai balasan', function () {
    $guru = forumUser('Guru Forum', forumRole('guru'));
    $siswa = forumUser('Siswa Forum', forumRole('siswa'));

    $materi = forumMateri($guru);

    $post = MateriDiscussion::create([
        'materi_id' => $materi->id,
        'user_id' => $siswa->id,
        'pesan' => 'Pertanyaan utama dari siswa',
    ]);

    $this->actingAs($siswa)
        ->post("/materi-saya/{$materi->id}/discussion", [
            'pesan' => 'Balasan dari siswa',
            'parent_id' => $post->id,
        ])
        ->assertSessionHas('success');

    $reply = MateriDiscussion::where('pesan', 'Balasan dari siswa')->first();
    expect($reply)->not->toBeNull();
    expect($reply->parent_id)->toBe($post->id);
});

test('guru melihat forum diskusi di halaman detail materi', function () {
    $guru = forumUser('Guru Lihat Forum', forumRole('guru'));
    $siswa = forumUser('Siswa Lihat Forum', forumRole('siswa'));

    $materi = forumMateri($guru);

    MateriDiscussion::create([
        'materi_id' => $materi->id,
        'user_id' => $siswa->id,
        'pesan' => 'Diskusi terlihat oleh guru',
    ]);

    $this->actingAs($guru)
        ->get("/materi/{$materi->id}")
        ->assertOk()
        ->assertSee('Diskusi terlihat oleh guru');
});

test('guru dapat membalas dan menghapus diskusi siswa', function () {
    $guru = forumUser('Guru Moderasi', forumRole('guru'));
    $siswa = forumUser('Siswa Moderasi', forumRole('siswa'));

    $materi = forumMateri($guru);

    $post = MateriDiscussion::create([
        'materi_id' => $materi->id,
        'user_id' => $siswa->id,
        'pesan' => 'Postingan siswa',
    ]);

    $this->actingAs($guru)
        ->post("/materi/{$materi->id}/discussion", [
            'pesan' => 'Jawaban dari guru',
            'parent_id' => $post->id,
        ])
        ->assertSessionHas('success');

    expect(MateriDiscussion::where('pesan', 'Jawaban dari guru')->exists())->toBeTrue();

    $this->actingAs($guru)
        ->delete("/materi/discussions/{$post->id}")
        ->assertSessionHas('success');

    expect(MateriDiscussion::find($post->id))->toBeNull();
});
