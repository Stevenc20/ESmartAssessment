<?php

namespace Tests\Feature;

use App\Mail\AnnouncementMail;
use App\Models\Pertemuan;
use App\Models\Role;
use App\Models\User;
use App\Services\AnnouncementService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AnnouncementEmailTest extends TestCase
{
    use RefreshDatabase;

    public function test_announcement_service_queues_emails_to_target_users(): void
    {
        Mail::fake();

        $roleSiswa = Role::create(['role_name' => 'siswa', 'deskripsi' => 'Siswa']);
        $roleGuru = Role::create(['role_name' => 'guru', 'deskripsi' => 'Guru']);

        $siswa = User::factory()->create(['role_id' => $roleSiswa->id, 'status' => 'active', 'email' => 'siswa@test.com']);
        $guru = User::factory()->create(['role_id' => $roleGuru->id, 'status' => 'active', 'email' => 'guru@test.com']);

        $service = app(AnnouncementService::class);
        $service->sendEmailNotifications(
            'Ujian Semester',
            'Jadwal ujian semester telah rilis.',
            'siswa',
            'info',
            'Pengumuman'
        );

        Mail::assertQueued(AnnouncementMail::class, function ($mail) use ($siswa) {
            return $mail->hasTo($siswa->email) && $mail->judul === 'Ujian Semester';
        });

        Mail::assertNotQueued(AnnouncementMail::class, function ($mail) use ($guru) {
            return $mail->hasTo($guru->email);
        });
    }

    public function test_absen_buka_queues_email_to_students(): void
    {
        Mail::fake();

        $roleGuru = Role::create(['role_name' => 'guru', 'deskripsi' => 'Guru']);
        $roleSiswa = Role::create(['role_name' => 'siswa', 'deskripsi' => 'Siswa']);

        $guru = User::factory()->create(['role_id' => $roleGuru->id, 'status' => 'active']);
        $siswa = User::factory()->create(['role_id' => $roleSiswa->id, 'status' => 'active', 'email' => 'siswa_absen@test.com']);

        $roadmap = \App\Models\Roadmap::create([
            'judul' => 'Roadmap Pemrograman Web',
            'bulan' => 1,
            'tahun' => 2026,
            'created_by' => $guru->id,
        ]);

        $pertemuan = Pertemuan::create([
            'judul' => 'Pertemuan Pemrograman Web',
            'status' => 'published',
            'roadmap_id' => $roadmap->id,
            'urutan' => 1,
        ]);

        $response = $this->actingAs($guru)->postJson("/pertemuan/{$pertemuan->id}/absen/buka");

        $response->assertStatus(200);

        Mail::assertQueued(AnnouncementMail::class, function ($mail) use ($siswa, $pertemuan) {
            return $mail->hasTo($siswa->email) && str_contains($mail->judul, $pertemuan->judul);
        });
    }
}
