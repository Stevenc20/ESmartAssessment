<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Role;
use App\Models\InactiveStudent;

#[Signature("student:auto-deactivate")]
#[Description("Otomatis menonaktifkan siswa yang pasif berdasarkan absen berturut-turut")]
class AutoDeactivatePassiveStudents extends Command
{
    public function handle()
    {
        $roleSiswa = Role::where("role_name", "Siswa")->orWhere("role_name", "siswa")->first();
        if (!$roleSiswa) {
            $this->error("Role siswa tidak ditemukan.");
            return;
        }

        $students = User::with(["absensi" => function ($query) {
            $query->orderBy("created_at", "desc");
        }])->where("role_id", $roleSiswa->id)->where("status", "active")->get();

        $excludedNames = ["belajar sukses", "putra jaya eksis"];
        $recentlyRestoredIds = InactiveStudent::where("status", "restored")
            ->where("updated_at", ">=", now()->subDays(14))
            ->pluck("siswa_id")
            ->toArray();

        $deactivatedCount = 0;

        foreach ($students as $student) {
            if (in_array(strtolower($student->name), $excludedNames)) {
                continue;
            }
            if (in_array($student->id, $recentlyRestoredIds)) {
                continue;
            }

            // Ambil 3 absensi terakhir
            $recentAbsensi = $student->absensi->take(3);
            
            // Jika belum ada absensi, skip
            if ($recentAbsensi->isEmpty()) continue;

            $hasRecentHadir = false;
            $alpaCount = 0;

            foreach ($recentAbsensi as $a) {
                if (in_array($a->status, ["alpa", "tidak_hadir"])) {
                    $alpaCount++;
                } else {
                    $hasRecentHadir = true;
                }
            }

            // Jika dalam 3 pertemuan terakhir ada >= 2 alpa dan TIDAK ADA hadir sama sekali di rentang itu
            if ($alpaCount >= 2 && !$hasRecentHadir) {
                $student->update(["status" => "inactive"]);
                InactiveStudent::updateOrCreate(
                    ["siswa_id" => $student->id],
                    [
                        "alasan" => "Otomatis oleh sistem: Alpa/Tidak Hadir berturut-turut pada pertemuan terakhir",
                        "tanggal_nonaktif" => now()->toDateString(),
                        "status" => "inactive"
                    ]
                );
                $deactivatedCount++;
            }
        }

        $this->info("Berhasil menonaktifkan $deactivatedCount siswa secara otomatis.");
    }
}
