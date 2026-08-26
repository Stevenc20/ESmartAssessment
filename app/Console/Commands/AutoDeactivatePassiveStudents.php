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
        $siswaRole = Role::where('role_name', 'Siswa')->orWhere('role_name', 'siswa')->first();
        if (!$siswaRole) {
            $this->error("Role siswa tidak ditemukan.");
            return;
        }

        // Get all active students (we remove the 3-days limit to ensure it works on testing accounts too)
        // Except specific accounts specified by user
        $students = User::where('role_id', $siswaRole->id)
            ->where('status', 'active')
            ->whereRaw('LOWER(name) NOT IN (?, ?)', ['belajar sukses', 'putra jaya eksis'])
            ->with(['absensi', 'progressMateri'])
            ->get();

        $deactivatedCount = 0;

        foreach ($students as $student) {
            // Take the latest 3 absensi in memory
            $absensi = $student->absensi->sortByDesc('created_at')->take(3);
            $progress = $student->progressMateri;

            $hasRecentHadir = false;
            foreach ($absensi as $a) {
                if ($a->status !== 'alpa' && $a->status !== 'tidak_hadir') {
                    $hasRecentHadir = true;
                    break;
                }
            }

            // If they have NO absensi records yet at all, we might skip them or count them as passive. 
            // If the user wants 17 students that "banyak yang alfa" deactivated, they must have alpa records.
            // Let's only deactivate if they actually have at least 1 alpa in those latest records.
            $hasAlpa = $absensi->whereIn('status', ['alpa', 'tidak_hadir'])->isNotEmpty();

            // Evaluate Quiz Progress
            $quizAvg = $progress->avg('quiz_score') ?? 0;
            $quizAttempts = $progress->sum('quiz_attempts') ?? 0;

            $isPassiveInQuiz = ($quizAttempts == 0) || ($quizAvg < 50);

            // If they have no recent attendance (but have alpa) AND passive in quizzes
            if ($hasAlpa && !$hasRecentHadir && $isPassiveInQuiz) {
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
