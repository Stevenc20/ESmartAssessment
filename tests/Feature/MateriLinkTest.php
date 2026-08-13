<?php

use App\Models\Materi;
use App\Models\MateriQuiz;
use App\Models\Pertemuan;
use App\Models\ProgressMateri;
use App\Models\Roadmap;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

function linkRole(string $name): Role
{
    return Role::where('role_name', $name)->first() ?? Role::create(['role_name' => $name]);
}

function linkUser(string $name, Role $role): User
{
    return User::create([
        'name' => $name,
        'email' => strtolower(str_replace(' ', '', $name)).'@test.test',
        'password' => 'password',
        'role_id' => $role->id,
        'status' => 'active',
    ]);
}

function linkRoadmap(User $guru, string $judul): Roadmap
{
    return Roadmap::create([
        'judul' => $judul,
        'bulan' => 8,
        'tahun' => 2026,
        'tingkat' => '10',
        'created_by' => $guru->id,
    ]);
}

function linkPertemuan(Roadmap $roadmap, string $judul, int $urutan): Pertemuan
{
    return Pertemuan::create([
        'roadmap_id' => $roadmap->id,
        'judul' => $judul,
        'urutan' => $urutan,
        'status' => 'published',
    ]);
}

function createLinkSource(User $guru, Pertemuan $pertemuan, string $judul = 'Materi Sumber'): Materi
{
    Storage::fake('public');

    test()->actingAs($guru)->post('/materi', [
        'pertemuan_id' => $pertemuan->id,
        'judul' => $judul,
        'deskripsi' => 'Konten dari sumber',
        'drive_link' => 'https://drive.google.com/source',
        'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'tingkat' => '10',
        'folders' => [
            [
                'nama' => 'Sumber',
                'files' => [
                    UploadedFile::fake()->create('modul.pdf', 10),
                ],
                'names' => [
                    'Sumber/modul.pdf',
                ],
            ],
        ],
    ])->assertRedirect('/materi');

    return Materi::where('judul', $judul)->firstOrFail();
}

function createLinkWrapper(User $guru, Pertemuan $pertemuan, int $linkedMateriId, string $judul = 'Materi Tautan'): Materi
{
    test()->actingAs($guru)->post('/materi', [
        'pertemuan_id' => $pertemuan->id,
        'linked_materi_id' => $linkedMateriId,
        'judul' => $judul,
    ])->assertRedirect('/materi');

    return Materi::where('judul', $judul)->firstOrFail();
}

test('guru dapat menautkan materi sebelumnya menjadi materi baru', function () {
    $guru = linkUser('Guru Link', linkRole('guru'));

    $roadmap = linkRoadmap($guru, 'Roadmap Link');
    $pertemuan1 = linkPertemuan($roadmap, 'Pertemuan 1', 1);
    $pertemuan2 = linkPertemuan($roadmap, 'Pertemuan 2', 2);

    $source = createLinkSource($guru, $pertemuan1);

    $this->actingAs($guru)->post('/materi', [
        'pertemuan_id' => $pertemuan2->id,
        'linked_materi_id' => $source->id,
        'judul' => 'Materi Tautan',
    ])->assertRedirect('/materi')
        ->assertSessionHas('success', 'Materi berhasil ditautkan.');

    $wrapper = Materi::where('judul', 'Materi Tautan')->first();

    expect($wrapper)->not->toBeNull();
    expect($wrapper->linked_materi_id)->toBe($source->id);
    expect($wrapper->pertemuan_id)->toBe($pertemuan2->id);
    expect($wrapper->isLink())->toBeTrue();
    expect($wrapper->source()->is($source))->toBeTrue();
    expect($wrapper->tingkat)->toBe('10');
    expect($wrapper->folders()->count())->toBe(0);
    expect($wrapper->files()->count())->toBe(0);
    expect($source->folders()->count())->toBe(1);
});

test('materi tautan tidak dapat menautkan materi lain (tanpa rantai)', function () {
    $guru = linkUser('Guru Rantai', linkRole('guru'));

    $roadmap = linkRoadmap($guru, 'Roadmap Rantai');
    $pertemuan1 = linkPertemuan($roadmap, 'Pertemuan 1', 1);
    $pertemuan2 = linkPertemuan($roadmap, 'Pertemuan 2', 2);

    $source = createLinkSource($guru, $pertemuan1);
    $wrapper = createLinkWrapper($guru, $pertemuan2, $source->id);

    $this->actingAs($guru)->post('/materi', [
        'pertemuan_id' => $pertemuan2->id,
        'linked_materi_id' => $wrapper->id,
        'judul' => 'Rantai Ketiga',
    ])->assertSessionHasErrors('linked_materi_id');

    expect(Materi::count())->toBe(2);
});

test('materi tautan wajib memiliki pertemuan tujuan', function () {
    $guru = linkUser('Guru Tanpa Pertemuan', linkRole('guru'));

    $roadmap = linkRoadmap($guru, 'Roadmap Tanpa Pertemuan');
    $pertemuan1 = linkPertemuan($roadmap, 'Pertemuan 1', 1);

    $source = createLinkSource($guru, $pertemuan1);

    $this->actingAs($guru)->post('/materi', [
        'linked_materi_id' => $source->id,
        'judul' => 'Tanpa Pertemuan',
    ])->assertSessionHasErrors('pertemuan_id');

    expect(Materi::count())->toBe(1);
});

test('halaman detail guru menampilkan konten sumber dan info tautan', function () {
    $guru = linkUser('Guru Detail', linkRole('guru'));

    $roadmap = linkRoadmap($guru, 'Roadmap Detail');
    $pertemuan1 = linkPertemuan($roadmap, 'Pertemuan 1', 1);
    $pertemuan2 = linkPertemuan($roadmap, 'Pertemuan 2', 2);

    $source = createLinkSource($guru, $pertemuan1);
    $wrapper = createLinkWrapper($guru, $pertemuan2, $source->id);

    $this->actingAs($guru)->get("/materi/{$wrapper->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('materi/show')
            ->where('materi.id', $wrapper->id)
            ->where('materi.linked_to.id', $source->id)
            ->where('materi.linked_to.judul', 'Materi Sumber')
            ->where('materi.linked_to.pertemuan', 'Pertemuan 1')
            ->where('materi.drive_link', 'https://drive.google.com/source')
            ->where('materi.video_url', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
            ->where('materi.pertemuan', 'Pertemuan 2')
            ->has('materi.folders', 1)
        );
});

test('daftar materi menyertakan linked_to pada materi tautan', function () {
    $guru = linkUser('Guru Daftar', linkRole('guru'));

    $roadmap = linkRoadmap($guru, 'Roadmap Daftar');
    $pertemuan1 = linkPertemuan($roadmap, 'Pertemuan 1', 1);
    $pertemuan2 = linkPertemuan($roadmap, 'Pertemuan 2', 2);

    $source = createLinkSource($guru, $pertemuan1);
    $wrapper = createLinkWrapper($guru, $pertemuan2, $source->id);

    $response = $this->actingAs($guru)->get('/materi')
        ->assertOk();

    $list = collect($response->viewData('page')['props']['materiList']);

    $sourceEntry = $list->firstWhere('id', $source->id);
    expect($sourceEntry['linked_to'])->toBeNull();

    $wrapperEntry = $list->firstWhere('id', $wrapper->id);
    expect($wrapperEntry['linked_to']['id'])->toBe($source->id);
    expect($wrapperEntry['linked_to']['judul'])->toBe('Materi Sumber');
    expect($wrapperEntry['linked_to']['pertemuan'])->toBe('Pertemuan 1');
});

test('materi sumber yang ditautkan tidak dapat dihapus', function () {
    $guru = linkUser('Guru Hapus Sumber', linkRole('guru'));

    $roadmap = linkRoadmap($guru, 'Roadmap Hapus Sumber');
    $pertemuan1 = linkPertemuan($roadmap, 'Pertemuan 1', 1);
    $pertemuan2 = linkPertemuan($roadmap, 'Pertemuan 2', 2);

    $source = createLinkSource($guru, $pertemuan1);
    $wrapper = createLinkWrapper($guru, $pertemuan2, $source->id);

    $this->actingAs($guru)->delete("/materi/{$source->id}")
        ->assertRedirect('/materi')
        ->assertSessionHas('error');

    expect(Materi::find($source->id))->not->toBeNull();
    expect(Materi::find($wrapper->id))->not->toBeNull();
});

test('materi tautan dapat dihapus tanpa menghapus sumber', function () {
    $guru = linkUser('Guru Hapus Tautan', linkRole('guru'));

    $roadmap = linkRoadmap($guru, 'Roadmap Hapus Tautan');
    $pertemuan1 = linkPertemuan($roadmap, 'Pertemuan 1', 1);
    $pertemuan2 = linkPertemuan($roadmap, 'Pertemuan 2', 2);

    $source = createLinkSource($guru, $pertemuan1);
    $wrapper = createLinkWrapper($guru, $pertemuan2, $source->id);

    $this->actingAs($guru)->delete("/materi/{$wrapper->id}")
        ->assertRedirect('/materi')
        ->assertSessionHas('success', 'Materi berhasil dihapus.');

    expect(Materi::find($wrapper->id))->toBeNull();
    expect(Materi::find($source->id))->not->toBeNull();
});

test('edit materi tautan dialihkan ke daftar materi', function () {
    $guru = linkUser('Guru Edit', linkRole('guru'));

    $roadmap = linkRoadmap($guru, 'Roadmap Edit');
    $pertemuan1 = linkPertemuan($roadmap, 'Pertemuan 1', 1);
    $pertemuan2 = linkPertemuan($roadmap, 'Pertemuan 2', 2);

    $source = createLinkSource($guru, $pertemuan1);
    $wrapper = createLinkWrapper($guru, $pertemuan2, $source->id);

    $this->actingAs($guru)->get("/materi/{$wrapper->id}/edit")
        ->assertRedirect('/materi')
        ->assertSessionHas('error');
});

test('siswa melihat konten sumber pada materi tautan dengan progress terpisah', function () {
    $guru = linkUser('Guru Sumber', linkRole('guru'));
    $siswa = linkUser('Siswa Tautan', linkRole('siswa'));

    $roadmap = linkRoadmap($guru, 'Roadmap Siswa');
    $pertemuan1 = linkPertemuan($roadmap, 'Pertemuan 1', 1);
    $pertemuan2 = linkPertemuan($roadmap, 'Pertemuan 2', 2);

    $source = createLinkSource($guru, $pertemuan1);

    MateriQuiz::create([
        'materi_id' => $source->id,
        'soal' => 'Berapa hasil 2 + 2?',
        'opsi' => ['3', '4'],
        'jawaban_benar' => '4',
        'urutan' => 1,
    ]);

    $wrapper = createLinkWrapper($guru, $pertemuan2, $source->id);

    $this->actingAs($siswa)->get("/materi-saya/{$wrapper->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('materi/siswa-detail')
            ->where('materi.id', $wrapper->id)
            ->where('materi.linked_to.id', $source->id)
            ->where('materi.drive_link', 'https://drive.google.com/source')
            ->where('materi.progress_status', 'not_started')
            ->where('materi.quiz.0.soal', 'Berapa hasil 2 + 2?')
            ->has('materi.folders', 1)
        );

    $quizQuestion = $source->quiz()->firstOrFail();

    $this->actingAs($siswa)->post("/materi-saya/{$wrapper->id}/quiz", [
        'answers' => [$quizQuestion->id => '4'],
    ])->assertSessionHas('success');

    $wrapperProgress = ProgressMateri::where('siswa_id', $siswa->id)
        ->where('materi_id', $wrapper->id)
        ->first();

    expect($wrapperProgress)->not->toBeNull();
    expect((float) $wrapperProgress->quiz_score)->toBe(100.0);
    expect($wrapperProgress->quiz_attempts)->toBe(1);

    expect(ProgressMateri::where('siswa_id', $siswa->id)
        ->where('materi_id', $source->id)
        ->count())->toBe(0);
});
