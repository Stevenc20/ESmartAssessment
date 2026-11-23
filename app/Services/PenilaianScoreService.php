<?php

namespace App\Services;

use App\Models\Pertemuan;
use App\Models\PengumpulanTugas;
use App\Models\ProgressMateri;
use App\Models\User;

class PenilaianScoreService
{
    /**
     * Hitung nilai rata-rata dan detail assessment untuk satu siswa atau semua siswa
     * secara konsisten antara dashboard siswa, halaman nilai saya, dan rekap penilaian guru.
     */
    public function calculateStudentScore(User $siswa): array
    {
        $pertemuanList = Pertemuan::with([
            'materi.quiz',
            'materi.tugas',
            'materi.linkedMateri.quiz',
            'materi.linkedMateri.tugas',
        ])
        ->get();

        $totalQuizzesAvailable = 0;
        $totalTugasAvailable = 0;
        $totalPertemuanWithAssessment = 0;

        foreach ($pertemuanList as $p) {
            $materiList = $p->materi;
            $srcMateri = $materiList->map(fn ($m) => $m->source());
            $hasQuiz = $srcMateri->flatMap(fn ($m) => $m->quiz)->isNotEmpty();
            $hasTugas = $srcMateri->flatMap(fn ($m) => $m->tugas)->isNotEmpty();

            if ($hasQuiz) {
                $totalQuizzesAvailable++;
            }
            if ($hasTugas) {
                $totalTugasAvailable++;
            }
            if ($hasQuiz || $hasTugas) {
                $totalPertemuanWithAssessment++;
            }
        }

        $totalAssessmentsAvailable = $totalQuizzesAvailable + $totalTugasAvailable;

        $totalScoreSum = 0;
        $countEvaluated = 0;
        $quizzesDoneCount = 0;
        $tugasDoneCount = 0;

        foreach ($pertemuanList as $p) {
            $materiList = $p->materi;
            $materiIds = $materiList->pluck('id');
            $srcMateri = $materiList->map(fn ($m) => $m->source());

            $quizProgress = ProgressMateri::where('siswa_id', $siswa->id)
                ->whereIn('materi_id', $materiIds)
                ->where(function ($q) {
                    $q->whereNotNull('quiz_score')
                        ->orWhere('quiz_attempts', '>', 0);
                })
                ->get();

            $quizScores = $quizProgress->pluck('quiz_score')->filter(fn ($v) => $v !== null);
            $maxQuizScore = $quizScores->isNotEmpty() ? round($quizScores->max(), 2) : null;

            $hasQuizInMeeting = $srcMateri->flatMap(fn ($m) => $m->quiz)->isNotEmpty();
            if ($hasQuizInMeeting && $quizProgress->isNotEmpty()) {
                $quizzesDoneCount++;
            }

            $tugasIds = $srcMateri->flatMap(fn ($m) => $m->tugas)->pluck('id');
            $pengumpulan = PengumpulanTugas::where('siswa_id', $siswa->id)
                ->whereIn('tugas_id', $tugasIds)
                ->get();

            if ($tugasIds->isNotEmpty() && $pengumpulan->isNotEmpty()) {
                $tugasDoneCount++;
            }

            $tugasNilai = $pengumpulan
                ->filter(fn ($ts) => $ts->penilaian && $ts->penilaian->nilai !== null)
                ->map(fn ($ts) => $ts->penilaian->nilai);

            $avgTugasScore = $tugasNilai->isNotEmpty() ? round($tugasNilai->avg(), 2) : null;

            $combinedScore = null;
            if ($maxQuizScore !== null && $avgTugasScore !== null) {
                $combinedScore = round(($maxQuizScore + $avgTugasScore) / 2, 2);
            } elseif ($maxQuizScore !== null) {
                $combinedScore = $maxQuizScore;
            } elseif ($avgTugasScore !== null) {
                $combinedScore = $avgTugasScore;
            }

            if ($combinedScore !== null) {
                $totalScoreSum += $combinedScore;
                $countEvaluated++;
            }
        }

        $overallAvg = $totalPertemuanWithAssessment > 0
            ? round($totalScoreSum / $totalPertemuanWithAssessment, 2)
            : ($countEvaluated > 0 ? round($totalScoreSum / $countEvaluated, 2) : 0);

        $grade = $overallAvg >= 75 ? 'A' : 'B';

        return [
            'overall_avg' => $overallAvg,
            'grade' => $grade,
            'count_evaluated' => $countEvaluated,
            'total_pertemuan_with_assessment' => $totalPertemuanWithAssessment,
            'total_assessments_available' => $totalAssessmentsAvailable,
            'quizzes_done' => $quizzesDoneCount,
            'tugas_done' => $tugasDoneCount,
            'total_done' => $quizzesDoneCount + $tugasDoneCount,
        ];
    }
}
