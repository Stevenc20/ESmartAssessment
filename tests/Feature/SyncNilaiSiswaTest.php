<?php

use App\Models\Materi;
use App\Models\MateriQuiz;
use App\Models\Pertemuan;
use App\Models\ProgressMateri;
use App\Models\Roadmap;
use App\Models\Role;
use App\Models\Tugas;
use App\Models\User;

test('rata-rata nilai siswa di dashboard dan nilai-saya sinkron dengan rekap guru', function () {
    $guruRole = Role::firstOrCreate(['role_name' => 'guru']);
    $siswaRole = Role::firstOrCreate(['role_name' => 'siswa']);

    $guru = User::factory()->create([
        'role_id' => $guruRole->id,
        'status' => 'active',
    ]);

    $siswa = User::factory()->create([
        'name' => 'Siswa Sync Test',
        'role_id' => $siswaRole->id,
        'status' => 'active',
    ]);

    $roadmap = Roadmap::create([
        'judul' => 'Roadmap Sync Test',
        'bulan' => 11,
        'tahun' => 2026,
        'created_by' => $guru->id,
    ]);

    // Pertemuan 1 dengan Quiz
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

    // Pertemuan 2 dengan Tugas
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
    Tugas::create([
        'materi_id' => $materi2->id,
        'judul' => 'Tugas 2',
        'bobot' => 100,
        'max_revisi' => 2,
    ]);

    // Siswa hanya mengerjakan Pertemuan 1 dan dapat nilai 100. Pertemuan 2 belum dikerjakan (0).
    ProgressMateri::create([
        'siswa_id' => $siswa->id,
        'materi_id' => $materi1->id,
        'status' => 'completed',
        'quiz_score' => 100,
        'quiz_attempts' => 1,
    ]);

    // 1. Cek di Rekap Penilaian Guru
    $guruResponse = $this->actingAs($guru)->get('/penilaian-materi');
    $guruResponse->assertOk();
    $studentsProp = collect($guruResponse->original->getData()['page']['props']['students']);
    $studentDataGuru = $studentsProp->firstWhere('id', $siswa->id);
    expect($studentDataGuru['rata_rata'])->toBe(50.0);
    expect($studentDataGuru['predikat'])->toBe('B');

    // 2. Cek di Dashboard Siswa: harus 50.0 dan Grade B (bukan 100!)
    $dashboardResponse = $this->actingAs($siswa)->get('/dashboard');
    $dashboardResponse->assertOk();
    $studentDashboardProp = $dashboardResponse->original->getData()['page']['props']['studentDashboard'];
    expect($studentDashboardProp['rataNilai'])->toBe(50.0);
    expect($studentDashboardProp['grade'])->toBe('B');

    // 3. Cek di Halaman Nilai Saya Siswa: harus 50.0 dan Grade B (bukan 100!)
    $nilaiSayaResponse = $this->actingAs($siswa)->get('/nilai-saya');
    $nilaiSayaResponse->assertOk();
    $statsProp = $nilaiSayaResponse->original->getData()['page']['props']['stats'];
    expect($statsProp['overall_avg'])->toBe(50.0);
    expect($statsProp['grade'])->toBe('B');
});
