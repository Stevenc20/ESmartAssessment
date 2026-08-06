<?php

namespace Tests\Feature;

use App\Models\Announcement;
use App\Models\GlobalAnnouncement;
use App\Models\Role;
use App\Models\User;
use App\Services\AnnouncementService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class AnnouncementServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_announcement_service_lists_for_user(): void
    {
        $role = Role::create(['role_name' => 'siswa', 'deskripsi' => 'Siswa']);
        $user = User::factory()->create(['role_id' => $role->id]);

        Announcement::create([
            'judul' => 'Pengumuman Regular Test',
            'isi' => 'Isi pengumuman regular',
            'target_role' => 'siswa',
            'created_by' => $user->id,
        ]);

        GlobalAnnouncement::create([
            'judul' => 'Pengumuman Global Test',
            'isi' => 'Isi pengumuman global',
            'type' => 'info',
            'is_active' => true,
            'target_role' => 'all',
        ]);

        $service = app(AnnouncementService::class);
        $list = $service->listForUser($user);

        $this->assertCount(2, $list);
    }

    public function test_announcement_service_unread_counts_and_mark_all_read(): void
    {
        $role = Role::create(['role_name' => 'siswa', 'deskripsi' => 'Siswa']);
        $user = User::factory()->create(['role_id' => $role->id]);

        Announcement::create([
            'judul' => 'Pengumuman Regular',
            'isi' => 'Isi',
            'target_role' => 'siswa',
            'created_by' => $user->id,
        ]);

        $service = app(AnnouncementService::class);
        $unread = $service->unreadCountsForUser($user);

        $this->assertEquals(1, $unread['pengumuman']);

        $service->markAllRead($user);

        $unreadAfter = $service->unreadCountsForUser($user);
        $this->assertEquals(0, $unreadAfter['pengumuman']);
    }

    public function test_api_unread_counts_endpoint(): void
    {
        $role = Role::create(['role_name' => 'guru', 'deskripsi' => 'Guru']);
        $user = User::factory()->create(['role_id' => $role->id]);

        $response = $this->actingAs($user)->getJson('/api/unread-counts');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'unreadCounts' => ['pengumuman', 'materi', 'assessment'],
            ]);
    }
}
