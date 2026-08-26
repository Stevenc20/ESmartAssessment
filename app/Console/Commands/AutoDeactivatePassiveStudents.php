<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

use App\Models\User;
use App\Models\Role;
use App\Models\InactiveStudent;

#[Signature('student:auto-deactivate')]
#[Description('Otomatis menonaktifkan siswa yang sangat pasif (tidak hadir & kuis rendah)')]
class AutoDeactivatePassiveStudents extends Command
{
    public function handle()
    {
        $siswaRole = Role::where('name', 'Siswa')->first();
        if (!$siswaRole) return;

        // Get all active students created more than 3 days ago
        $students = User::where('role_id', $siswaRole->id)
            ->where('status', 'active')
            ->where('created_at', '<', now()->subDays(3))
            ->with(['absensi' => function($q) {
                $q->orderBy('created_at', 'desc')->take(3);
            }, 'progressMateri'])
            ->get();

        $deactivatedCount = 0;

        foreach ($students as $student) {
            $absensi = $student->absensi;
            $progress = $student->progressMateri;

            $hasRecentHadir = false;
            foreach ($absensi as $a) {
                if ($a->status !== 'alpa' && $a->status !== 'tidak_hadir') {
                    $hasRecentHadir = true;
                    break;
                }
            }

            // Evaluate Quiz Progress
            $quizAvg = $progress->avg('quiz_score') ?? 0;
            $quizAttempts = $progress->sum('quiz_attempts') ?? 0;

            $isPassiveInQuiz = ($quizAttempts == 0) || ($quizAvg < 50);

            // If they have no recent attendance (all alpa or empty) AND passive in quizzes
            if (!$hasRecentHadir && $isPassiveInQuiz) {
                $student->update(['status' => 'inactive']);
                
                InactiveStudent::updateOrCreate(
                    ['siswa_id' => $student->id],
                    [
                        'alasan' => 'Otomatis oleh sistem: Aktivitas kuis dan kehadiran sangat rendah',
                        'tanggal_nonaktif' => now()->toDateString(),
                        'status' => 'inactive'
                    ]
                );
                
                $deactivatedCount++;
            }
        }

        $this->info("Berhasil menonaktifkan $deactivatedCount siswa secara otomatis.");
    }
}
