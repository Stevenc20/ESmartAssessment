<?php

namespace Database\Seeders;

use App\Models\Badge;
use App\Services\BadgeService;
use Illuminate\Database\Seeder;

class BadgeSeeder extends Seeder
{
    public function run(): void
    {
        $badges = [
            [
                'badge_name' => 'Langkah Pertama',
                'icon' => '🥉',
                'description' => 'Menyelesaikan setidaknya 1 materi pembelajaran atau tugas.',
                'conditions' => ['type' => 'materi_count', 'operator' => '>=', 'value' => 1],
            ],
            [
                'badge_name' => 'Pembelajar Tekun',
                'icon' => '🥈',
                'description' => 'Menyelesaikan 5 materi pembelajaran atau tugas.',
                'conditions' => ['type' => 'materi_count', 'operator' => '>=', 'value' => 5],
            ],
            [
                'badge_name' => 'Master Pembelajar',
                'icon' => '🥇',
                'description' => 'Menyelesaikan 10 materi pembelajaran atau tugas.',
                'conditions' => ['type' => 'materi_count', 'operator' => '>=', 'value' => 10],
            ],
            [
                'badge_name' => 'Nilai Sempurna 100',
                'icon' => '🎯',
                'description' => 'Mendapatkan nilai sempurna 100 pada Quiz atau Tugas.',
                'conditions' => ['type' => 'assessment_perfect', 'operator' => '==', 'value' => true],
            ],
            [
                'badge_name' => 'Bintang Kelas',
                'icon' => '🌟',
                'description' => 'Mempertahankan rata-rata nilai keseluruhan 85 atau lebih tinggi.',
                'conditions' => ['type' => 'assessment_avg_score', 'operator' => '>=', 'value' => 85],
            ],
            [
                'badge_name' => 'Kolektor Poin',
                'icon' => '⚡',
                'description' => 'Mengumpulkan 100 poin reward pembelajaran.',
                'conditions' => ['type' => 'points_earned', 'operator' => '>=', 'value' => 100],
            ],
        ];

        foreach ($badges as $b) {
            Badge::updateOrCreate(
                ['badge_name' => $b['badge_name']],
                $b
            );
        }

        // Run retroactive evaluation for all existing students
        app(BadgeService::class)->evaluateForAllStudents();
    }
}
