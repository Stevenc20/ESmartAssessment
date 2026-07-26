<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $mapping = ['X' => '10', 'XI' => '11', 'XII' => '12'];

        foreach ($mapping as $roman => $arabic) {
            DB::table('kelas')->where('tingkat', $roman)->update(['tingkat' => $arabic]);
        }

        $siswaRole = DB::table('roles')->where('role_name', 'siswa')->first();
        if (! $siswaRole) {
            return;
        }

        $siswa = DB::table('users')
            ->where('role_id', $siswaRole->id)
            ->where('status', 'active')
            ->whereNotNull('kelas')
            ->get();

        foreach ($siswa as $s) {
            $kelas = DB::table('kelas')->where('tingkat', $s->kelas)->first();
            if ($kelas) {
                DB::table('siswa_kelas')->updateOrInsert(
                    ['siswa_id' => $s->id, 'kelas_id' => $kelas->id],
                    ['tanggal_masuk' => now()->toDateString(), 'created_at' => now(), 'updated_at' => now()]
                );
            }
        }
    }

    public function down(): void
    {
        $mapping = ['10' => 'X', '11' => 'XI', '12' => 'XII'];

        foreach ($mapping as $arabic => $roman) {
            DB::table('kelas')->where('tingkat', $arabic)->update(['tingkat' => $roman]);
        }
    }
};
