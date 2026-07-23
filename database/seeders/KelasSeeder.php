<?php

namespace Database\Seeders;

use App\Models\Kelas;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class KelasSeeder extends Seeder
{
    public function run(): void
    {
        $ta = DB::table('tahun_ajaran')->first();
        if (! $ta) {
            $taId = DB::table('tahun_ajaran')->insertGetId([
                'tahun' => '2025/2026',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            $taId = $ta->id;
        }

        $kelasData = [
            ['nama_kelas' => 'Genesis 10 RPL/PPLG', 'tingkat' => '10'],
            ['nama_kelas' => 'Ascend 11 RPL/PPLG', 'tingkat' => '11'],
        ];

        foreach ($kelasData as $kd) {
            Kelas::firstOrCreate(
                ['nama_kelas' => $kd['nama_kelas']],
                ['tingkat' => $kd['tingkat'], 'tahun_ajaran_id' => $taId]
            );
        }

        $roleSiswa = Role::where('role_name', 'siswa')->first();
        if (! $roleSiswa) {
            return;
        }

        $siswa = User::where('role_id', $roleSiswa->id)
            ->where('status', 'active')
            ->whereNotNull('kelas')
            ->get();

        foreach ($siswa as $s) {
            $kelas = Kelas::where('tingkat', $s->kelas)->first();
            if ($kelas) {
                DB::table('siswa_kelas')->updateOrInsert(
                    ['siswa_id' => $s->id, 'kelas_id' => $kelas->id],
                    ['tanggal_masuk' => now()->toDateString(), 'created_at' => now(), 'updated_at' => now()]
                );
            }
        }
    }
}
