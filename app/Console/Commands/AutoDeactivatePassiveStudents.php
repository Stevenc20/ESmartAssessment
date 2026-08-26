<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Models\User;
use App\Models\InactiveStudent;
use App\Services\AttendanceAlertService;

#[Signature("student:auto-deactivate")]
#[Description("Otomatis menonaktifkan siswa yang pasif berdasarkan threshold absensi")]
class AutoDeactivatePassiveStudents extends Command
{
    public function handle()
    {
        $alertService = app(AttendanceAlertService::class);
        $atRiskStudents = $alertService->studentsBelowThreshold(1000);

        if (empty($atRiskStudents)) {
            $this->info("Tidak ada siswa berisiko.");
            return;
        }

        // Jangan nonaktifkan akun testing
        $excludedNames = ["belajar sukses", "putra jaya eksis"];

        // Jangan nonaktifkan siswa yang baru saja dipulihkan (grace period 14 hari)
        $recentlyRestoredIds = InactiveStudent::where("status", "restored")
            ->where("updated_at", ">=", now()->subDays(14))
            ->pluck("siswa_id")
            ->toArray();

        $deactivatedCount = 0;

        foreach ($atRiskStudents as $risk) {
            if (in_array($risk["siswa_id"], $recentlyRestoredIds)) {
                continue;
            }

            $student = User::find($risk["siswa_id"]);
            if (!$student || $student->status !== "active") {
                continue;
            }

            if (in_array(strtolower($student->name), $excludedNames)) {
                continue;
            }

            // Deactivate
            $student->update(["status" => "inactive"]);
            
            InactiveStudent::updateOrCreate(
                ["siswa_id" => $student->id],
                [
                    "alasan" => "Otomatis oleh sistem: Kehadiran di bawah batas aman (" . $risk["persentase"] . "%) pada " . $risk["roadmap_judul"],
                    "tanggal_nonaktif" => now()->toDateString(),
                    "status" => "inactive"
                ]
            );
            
            $deactivatedCount++;
        }

        $this->info("Berhasil menonaktifkan $deactivatedCount siswa secara otomatis.");
    }
}
