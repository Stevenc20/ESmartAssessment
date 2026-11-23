<?php

use App\Models\Kelas;
use App\Models\Materi;
use App\Models\MateriQuiz;
use App\Models\Pertemuan;
use App\Models\ProgressMateri;
use App\Models\Roadmap;
use App\Models\Role;
use App\Models\TahunAjaran;
use App\Models\Tugas;
use App\Models\PengumpulanTugas;
use App\Models\PenilaianTugas;
use App\Models\User;

test('guru dapat melihat kolom status keaktifan pada rekap penilaian', function () {
    $guruRole = Role::firstOrCreate(['role_name' => 'guru']);
    $siswaRole = Role::firstOrCreate(['role_name' => 'siswa']);
    $ta = TahunAjaran::firstOrCreate(['tahun' => '2026/2027'], ['status' => 'active']);

    $guru = User::factory()->create([
        'role_id' => $guruRole->id,
        'status' => 'active',
    ]);

    $kelas10 = Kelas::create(['nama_kelas' => 'Genesis 10 RPL', 'tingkat' => '10', 'tahun_ajaran_id' => $ta->id]);

    $siswa1 = User::factory()->create([
        'role_id' => $siswaRole->id,
        'kelas' => '10',
        'jurusan' => 'RPL_PPLG',
        'status' => 'active',
    ]);
    $siswa1->kelas()->attach($kelas10->id, ['tanggal_masuk' => now()->toDateString()]);

    $siswa2 = User::factory()->create([
        'role_id' => $siswaRole->id,
        'kelas' => '11',
        'jurusan' => 'DKV_1',
        'status' => 'active',
    ]);

    $roadmap = Roadmap::create([
        'judul' => 'Roadmap Test',
        'bulan' => 10,
        'tahun' => 2026,
        'created_by' => $guru->id,
    ]);
    $pertemuan = Pertemuan::create([
        'roadmap_id' => $roadmap->id,
        'judul' => 'Pertemuan 1',
        'urutan' => 1,
        'status' => 'published',
    ]);

    $materi = Materi::create([
        'pertemuan_id' => $pertemuan->id,
        'judul' => 'Materi 1',
        'created_by' => $guru->id,
    ]);

    $quiz = MateriQuiz::create([
        'materi_id' => $materi->id,
        'soal' => 'Soal 1',
        'opsi' => ['A', 'B'],
        'jawaban_benar' => 'A',
        'urutan' => 1,
    ]);

    $tugas = Tugas::create([
        'materi_id' => $materi->id,
        'judul' => 'Tugas 1',
        'bobot' => 100,
        'max_revisi' => 2,
    ]);

    // Siswa 1 completes both quiz and tugas -> status_keaktifan = 'aktif'
    ProgressMateri::create([
        'siswa_id' => $siswa1->id,
        'materi_id' => $materi->id,
        'status' => 'completed',
        'quiz_score' => 85,
        'quiz_attempts' => 1,
    ]);
    $pengumpulan = PengumpulanTugas::create([
        'siswa_id' => $siswa1->id,
        'tugas_id' => $tugas->id,
        'file_tugas' => 'tugas.pdf',
        'revisi_ke' => 0,
    ]);
    PenilaianTugas::create([
        'pengumpulan_id' => $pengumpulan->id,
        'guru_id' => $guru->id,
        'nilai' => 90,
    ]);

    // Siswa 2 does nothing -> status_keaktifan = 'tidak aktif'

    $response = $this->actingAs($guru)->get('/penilaian-materi');
    $response->assertOk();

    $studentsProp = collect($response->original->getData()['page']['props']['students']);
    $student1Data = $studentsProp->firstWhere('id', $siswa1->id);
    $student2Data = $studentsProp->firstWhere('id', $siswa2->id);

    expect($student1Data)->not->toBeNull();
    expect($student1Data['status_keaktifan'])->toBe('aktif');
    expect($student1Data['kelas_formatted'])->toBe('X-RPL/PPLG');

    expect($student2Data)->not->toBeNull();
    expect($student2Data['status_keaktifan'])->toBe('tidak aktif');
    expect($student2Data['kelas_formatted'])->toBe('XI-DKV-1');
});

test('guru dapat mengekspor rekap penilaian dengan format excel kolom yang diminta dan urut dari kelas 10 lalu 11', function () {
    $guruRole = Role::firstOrCreate(['role_name' => 'guru']);
    $siswaRole = Role::firstOrCreate(['role_name' => 'siswa']);
    $ta = TahunAjaran::firstOrCreate(['tahun' => '2026/2027'], ['status' => 'active']);

    $guru = User::factory()->create([
        'role_id' => $guruRole->id,
        'status' => 'active',
    ]);

    $kelas11 = Kelas::create(['nama_kelas' => 'Ascend 11 DKV 2', 'tingkat' => '11', 'tahun_ajaran_id' => $ta->id]);
    $kelas10 = Kelas::create(['nama_kelas' => 'Genesis 10 RPL', 'tingkat' => '10', 'tahun_ajaran_id' => $ta->id]);

    // Create siswa kelas 11 first in DB
    $siswa11 = User::factory()->create([
        'name' => 'Budi Siswa XI',
        'role_id' => $siswaRole->id,
        'kelas' => '11',
        'jurusan' => 'DKV_2',
        'status' => 'active',
    ]);
    $siswa11->kelas()->attach($kelas11->id, ['tanggal_masuk' => now()->toDateString()]);

    // Create siswa kelas 10 after
    $siswa10 = User::factory()->create([
        'name' => 'Andi Siswa X',
        'role_id' => $siswaRole->id,
        'kelas' => '10',
        'jurusan' => 'RPL_PPLG',
        'status' => 'active',
    ]);
    $siswa10->kelas()->attach($kelas10->id, ['tanggal_masuk' => now()->toDateString()]);

    $response = $this->actingAs($guru)->get('/penilaian-materi/export');
    $response->assertOk();
    $response->assertHeader('Content-Type', 'application/vnd.ms-excel; charset=utf-8');

    // Get stream content
    ob_start();
    $response->sendContent();
    $content = ob_get_clean();

    // Check header columns in HTML/XML table: no, nama, kelas, status keaktifan, nilai U
    expect($content)->toContain('>no</th>');
    expect($content)->toContain('>nama</th>');
    expect($content)->toContain('>kelas</th>');
    expect($content)->toContain('>status keaktifan</th>');
    expect($content)->toContain('>nilai U</th>');
    expect($content)->toContain('Andi Siswa X');
    expect($content)->toContain('Budi Siswa XI');

    // Posisi kelas 10 harus muncul sebelum kelas 11
    $posX = strpos($content, 'X-RPL/PPLG');
    $posXI = strpos($content, 'XI-DKV-2');
    expect($posX)->toBeLessThan($posXI);
});

test('perhitungan rata-rata nilai U membagi berdasarkan total pertemuan berpenugasan bukan hanya yang dikerjakan', function () {
    $guruRole = Role::firstOrCreate(['role_name' => 'guru']);
    $siswaRole = Role::firstOrCreate(['role_name' => 'siswa']);
    $ta = TahunAjaran::firstOrCreate(['tahun' => '2026/2027'], ['status' => 'active']);

    $guru = User::factory()->create([
        'role_id' => $guruRole->id,
        'status' => 'active',
    ]);

    $siswa = User::factory()->create([
        'name' => 'Cici Siswa Test',
        'role_id' => $siswaRole->id,
        'kelas' => '10',
        'jurusan' => 'RPL_PPLG',
        'status' => 'active',
    ]);

    $roadmap = Roadmap::create([
        'judul' => 'Roadmap Test 2 Pertemuan',
        'bulan' => 10,
        'tahun' => 2026,
        'created_by' => $guru->id,
    ]);

    // Pertemuan 1 with quiz
    $pertemuan1 = Pertemuan::create([
        'roadmap_id' => $roadmap->id,
        'judul' => 'Pertemuan 1',
        'urutan' => 1,
        'status' => 'published',
    ]);
    $materi1 = Materi::create([
        'pertemuan_id' => $pertemuan1->id,
        'judul' => 'Materi 1',
        'created_by' => $guru->id,
    ]);
    MateriQuiz::create([
        'materi_id' => $materi1->id,
        'soal' => 'Soal 1',
        'opsi' => ['A', 'B'],
        'jawaban_benar' => 'A',
        'urutan' => 1,
    ]);

    // Pertemuan 2 with quiz
    $pertemuan2 = Pertemuan::create([
        'roadmap_id' => $roadmap->id,
        'judul' => 'Pertemuan 2',
        'urutan' => 2,
        'status' => 'published',
    ]);
    $materi2 = Materi::create([
        'pertemuan_id' => $pertemuan2->id,
        'judul' => 'Materi 2',
        'created_by' => $guru->id,
    ]);
    MateriQuiz::create([
        'materi_id' => $materi2->id,
        'soal' => 'Soal 2',
        'opsi' => ['A', 'B'],
        'jawaban_benar' => 'A',
        'urutan' => 1,
    ]);

    // Siswa only completed Pertemuan 1 (score 100), Pertemuan 2 is NOT done (0)
    ProgressMateri::create([
        'siswa_id' => $siswa->id,
        'materi_id' => $materi1->id,
        'status' => 'completed',
        'quiz_score' => 100,
        'quiz_attempts' => 1,
    ]);

    $response = $this->actingAs($guru)->get('/penilaian-materi');
    $response->assertOk();

    $studentsProp = collect($response->original->getData()['page']['props']['students']);
    $studentData = $studentsProp->firstWhere('id', $siswa->id);

    // Because there are 2 meetings with assessments and student only did 1 meeting with score 100:
    // Average must be 100 / 2 = 50, NOT 100!
    expect($studentData['rata_rata'])->toBe(50.0);
    expect($studentData['predikat'])->toBe('B'); // 50 < 75 -> B
    expect($studentData['status_keaktifan'])->toBe('kurang aktif'); // 1 out of 2 = 50% = kurang aktif

    // Check export as well
    $exportResponse = $this->actingAs($guru)->get('/penilaian-materi/export');
    $exportResponse->assertOk();

    ob_start();
    $exportResponse->sendContent();
    $exportContent = ob_get_clean();

    expect($exportContent)->toContain('50.00');
    expect($exportContent)->toContain('(B)');
    expect($exportContent)->toContain('kurang aktif');
});
