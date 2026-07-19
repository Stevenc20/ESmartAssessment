<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class FeatureToggleSeeder extends Seeder
{
    public function run(): void
    {
        $features = [
            // ── Pembelajaran ──
            [
                'key' => 'feature_portfolio',
                'value' => 'true',
                'label' => 'Portfolio',
                'description' => 'Menampilkan dan mengelola portfolio karya siswa sebagai bukti hasil belajar',
                'group' => 'Pembelajaran',
                'type' => 'feature_toggle',
                'sort_order' => 1,
            ],
            [
                'key' => 'feature_ai_assistant',
                'value' => 'false',
                'label' => 'AI Assistant',
                'description' => 'Asisten AI cerdas untuk membantu siswa dalam proses pembelajaran dan tugas',
                'group' => 'Pembelajaran',
                'type' => 'feature_toggle',
                'sort_order' => 2,
            ],
            [
                'key' => 'feature_modul_belajar',
                'value' => 'true',
                'label' => 'Modul Belajar',
                'description' => 'Akses materi pembelajaran digital interaktif dan modul belajar mandiri',
                'group' => 'Pembelajaran',
                'type' => 'feature_toggle',
                'sort_order' => 3,
            ],
            [
                'key' => 'feature_tugas',
                'value' => 'true',
                'label' => 'Tugas',
                'description' => 'Fitur penugasan mandiri dan kelompok untuk mendukung kegiatan belajar siswa',
                'group' => 'Pembelajaran',
                'type' => 'feature_toggle',
                'sort_order' => 4,
            ],

            // ── Gamifikasi ──
            [
                'key' => 'feature_challenge',
                'value' => 'true',
                'label' => 'Challenge',
                'description' => 'Kompetisi dan challenge antar siswa untuk meningkatkan motivasi belajar',
                'group' => 'Gamifikasi',
                'type' => 'feature_toggle',
                'sort_order' => 5,
            ],
            [
                'key' => 'feature_ranking',
                'value' => 'true',
                'label' => 'Ranking',
                'description' => 'Peringkat siswa berdasarkan poin, pencapaian, dan aktivitas belajar',
                'group' => 'Gamifikasi',
                'type' => 'feature_toggle',
                'sort_order' => 6,
            ],
            [
                'key' => 'feature_poin_reward',
                'value' => 'true',
                'label' => 'Poin & Reward',
                'description' => 'Sistem penghargaan berbasis poin untuk memotivasi partisipasi siswa',
                'group' => 'Gamifikasi',
                'type' => 'feature_toggle',
                'sort_order' => 7,
            ],
            [
                'key' => 'feature_badge',
                'value' => 'true',
                'label' => 'Badge & Level',
                'description' => 'Lencana pencapaian dan sistem level untuk mengapresiasi progres siswa',
                'group' => 'Gamifikasi',
                'type' => 'feature_toggle',
                'sort_order' => 8,
            ],

            // ── Administrasi ──
            [
                'key' => 'feature_sertifikat',
                'value' => 'true',
                'label' => 'Sertifikat',
                'description' => 'Generate sertifikat otomatis untuk siswa yang lulus dan mencapai target',
                'group' => 'Administrasi',
                'type' => 'feature_toggle',
                'sort_order' => 9,
            ],
            [
                'key' => 'feature_presensi',
                'value' => 'true',
                'label' => 'Presensi Digital',
                'description' => 'Fitur absensi harian digital menggunakan QR code untuk siswa dan guru',
                'group' => 'Administrasi',
                'type' => 'feature_toggle',
                'sort_order' => 10,
            ],
            [
                'key' => 'feature_laporan_akademik',
                'value' => 'true',
                'label' => 'Laporan Akademik',
                'description' => 'Generate laporan hasil belajar dan analisis nilai siswa secara otomatis',
                'group' => 'Administrasi',
                'type' => 'feature_toggle',
                'sort_order' => 11,
            ],
            [
                'key' => 'feature_notifikasi',
                'value' => 'true',
                'label' => 'Notifikasi',
                'description' => 'Sistem notifikasi dan pengumuman untuk menginformasikan kegiatan platform',
                'group' => 'Administrasi',
                'type' => 'feature_toggle',
                'sort_order' => 12,
            ],
        ];

        foreach ($features as $feature) {
            SystemSetting::firstOrCreate(
                ['key' => $feature['key']],
                $feature
            );
        }
    }
}
