<?php

namespace Tests\Feature;

use App\Models\Pertemuan;
use App\Models\Materi;
use App\Models\Roadmap;
use App\Models\Role;
use App\Models\Tugas;
use App\Models\PengumpulanTugas;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TugasSubmissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_siswa_can_submit_multiple_files_for_assessment()
    {
        Storage::fake('public');

        $roleSiswa = Role::create([
            'role_name' => 'siswa',
            'display_name' => 'Siswa',
        ]);

        $siswa = User::factory()->create([
            'role_id' => $roleSiswa->id,
        ]);

        $roadmap = Roadmap::create([
            'judul' => 'Roadmap Desain',
            'bulan' => 8,
            'tahun' => 2026,
            'tingkat' => '10',
            'created_by' => $siswa->id,
            'urutan' => 1,
        ]);

        $pertemuan = Pertemuan::create([
            'roadmap_id' => $roadmap->id,
            'judul' => 'Pertemuan 1',
            'deskripsi' => 'Deskripsi Pertemuan 1',
            'urutan' => 1,
            'status' => 'published',
        ]);

        $materi = Materi::create([
            'pertemuan_id' => $pertemuan->id,
            'judul' => 'Materi Desain',
            'tipe' => 'dokumen',
            'created_by' => $siswa->id,
            'urutan' => 1,
        ]);

        $tugas = Tugas::create([
            'materi_id' => $materi->id,
            'judul' => 'Tugas Poster PSD',
            'deskripsi' => 'Buat poster',
            'deadline' => now()->addDays(2),
            'max_revisi' => 2,
            'bobot' => 10,
        ]);

        $file1 = UploadedFile::fake()->create('poster.psd', 2048);
        $file2 = UploadedFile::fake()->create('preview.png', 1024);
        $file3 = UploadedFile::fake()->create('document.pdf', 512);

        $response = $this->actingAs($siswa)
            ->from('/assessment')
            ->post("/materi-saya/tugas/{$tugas->id}/submit", [
                'files' => [$file1, $file2, $file3],
            ]);

        $response->assertStatus(302);
        $response->assertSessionHas('success');

        $this->assertDatabaseCount('pengumpulan_tugas', 1);

        $submission = PengumpulanTugas::first();
        $this->assertEquals($tugas->id, $submission->tugas_id);
        $this->assertEquals($siswa->id, $submission->siswa_id);
        $this->assertEquals(1, $submission->revisi_ke);

        $filesList = $submission->files_list;
        $this->assertCount(3, $filesList);
        $this->assertEquals('poster.psd', $filesList[0]['name']);
        $this->assertEquals('psd', $filesList[0]['ext']);
        $this->assertEquals('preview.png', $filesList[1]['name']);
        $this->assertEquals('png', $filesList[1]['ext']);
        $this->assertEquals('document.pdf', $filesList[2]['name']);
        $this->assertEquals('pdf', $filesList[2]['ext']);
    }

    public function test_siswa_upload_invalid_extension_fails_gracefully()
    {
        Storage::fake('public');

        $roleSiswa = Role::create([
            'role_name' => 'siswa',
            'display_name' => 'Siswa',
        ]);

        $siswa = User::factory()->create([
            'role_id' => $roleSiswa->id,
        ]);

        $roadmap = Roadmap::create([
            'judul' => 'Roadmap Desain',
            'bulan' => 8,
            'tahun' => 2026,
            'tingkat' => '10',
            'created_by' => $siswa->id,
            'urutan' => 1,
        ]);

        $pertemuan = Pertemuan::create([
            'roadmap_id' => $roadmap->id,
            'judul' => 'Pertemuan 1',
            'deskripsi' => 'Deskripsi Pertemuan 1',
            'urutan' => 1,
            'status' => 'published',
        ]);

        $materi = Materi::create([
            'pertemuan_id' => $pertemuan->id,
            'judul' => 'Materi Desain',
            'tipe' => 'dokumen',
            'created_by' => $siswa->id,
            'urutan' => 1,
        ]);

        $tugas = Tugas::create([
            'materi_id' => $materi->id,
            'judul' => 'Tugas Poster PSD',
            'deskripsi' => 'Buat poster',
            'deadline' => now()->addDays(2),
            'max_revisi' => 2,
            'bobot' => 10,
        ]);

        $badFile = UploadedFile::fake()->create('malicious.exe', 1024);

        $response = $this->actingAs($siswa)
            ->from('/assessment')
            ->post("/materi-saya/tugas/{$tugas->id}/submit", [
                'files' => [$badFile],
            ]);

        $response->assertStatus(302);
        $response->assertSessionHasErrors(['files']);
        $this->assertDatabaseCount('pengumpulan_tugas', 0);
    }
}
