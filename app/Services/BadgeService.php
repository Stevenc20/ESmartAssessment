<?php

namespace App\Services;

use App\Models\Badge;
use App\Models\PengumpulanTugas;
use App\Models\ProgressMateri;
use App\Models\Role;
use App\Models\StudentBadge;
use App\Models\StudentPoint;
use App\Models\User;

class BadgeService
{
    public function evaluateForStudent(User $siswa): array
    {
        $earnedBadgeIds = StudentBadge::where('siswa_id', $siswa->id)->pluck('badge_id');

        $available = Badge::whereNotNull('conditions')->whereNotIn('id', $earnedBadgeIds)->get();

        if ($available->isEmpty()) {
            return [];
        }

        $stats = $this->getStudentStats($siswa);
        $newlyEarned = [];

        foreach ($available as $badge) {
            if ($this->evaluateConditions($badge->conditions, $stats)) {
                StudentBadge::create([
                    'siswa_id' => $siswa->id,
                    'badge_id' => $badge->id,
                    'earned_at' => now(),
                ]);

                // Award 100 Reward Points for each earned badge
                StudentPoint::create([
                    'siswa_id' => $siswa->id,
                    'point' => 100,
                    'description' => 'Mendapatkan Badge: '.$badge->badge_name,
                ]);

                $newlyEarned[] = [
                    'id' => $badge->id,
                    'badge_name' => $badge->badge_name,
                    'icon' => $badge->icon,
                    'description' => $badge->description,
                    'points' => 100,
                ];
            }
        }

        return $newlyEarned;
    }

    public function evaluateForAllStudents(): int
    {
        $roleSiswa = Role::where('role_name', 'siswa')->first();
        if (! $roleSiswa) {
            return 0;
        }

        $siswaList = User::where('role_id', $roleSiswa->id)->get();
        $totalAwarded = 0;

        foreach ($siswaList as $siswa) {
            $newBadges = $this->evaluateForStudent($siswa);
            $totalAwarded += count($newBadges);
        }

        return $totalAwarded;
    }

    public function getStudentStats(User $siswa): array
    {
        // Assignment scores
        $assessments = PengumpulanTugas::where('siswa_id', $siswa->id)
            ->whereHas('penilaian')
            ->with('penilaian')
            ->get();

        $assignmentScores = $assessments->map(fn ($p) => (float) $p->penilaian->nilai);

        // Quiz scores & completed learning materials
        $materiProgress = ProgressMateri::where('siswa_id', $siswa->id)->get();
        $quizScores = $materiProgress->whereNotNull('quiz_score')->map(fn ($p) => (float) $p->quiz_score);
        $completedMateriCount = $materiProgress->where('status', 'completed')->count();

        // Combined scores
        $allScores = $assignmentScores->concat($quizScores);
        $totalItemsCount = max($completedMateriCount, $assessments->count(), $allScores->count());

        $avgScore = $allScores->isNotEmpty()
            ? round($allScores->avg(), 2)
            : 0;

        $hasPerfect = $allScores->contains(fn ($s) => $s >= 100);
        $totalPoints = StudentPoint::where('siswa_id', $siswa->id)->sum('point');

        return [
            'materi_count' => $totalItemsCount,
            'assessment_count' => $totalItemsCount,
            'assessment_avg_score' => $avgScore,
            'assessment_perfect' => $hasPerfect,
            'points_earned' => (int) $totalPoints,
        ];
    }

    public function evaluateConditions(?array $conditions, array $stats): bool
    {
        if (! $conditions || ! isset($conditions['type'])) {
            return false;
        }

        $type = $conditions['type'];
        $operator = $conditions['operator'] ?? '>=';
        $value = $conditions['value'] ?? 0;

        // Alias mapping for flexible condition types
        if ($type === 'materi_count' && ! isset($stats['materi_count'])) {
            $type = 'assessment_count';
        }

        $actual = $stats[$type] ?? null;

        if ($actual === null) {
            return false;
        }

        return match ($operator) {
            '>=' => $actual >= $value,
            '>' => $actual > $value,
            '<' => $actual < $value,
            '<=' => $actual <= $value,
            '==' => $actual == $value,
            default => false,
        };
    }

    public function getBadgesWithStatus(User $siswa): array
    {
        $earnedIds = StudentBadge::where('siswa_id', $siswa->id)->pluck('badge_id');
        $stats = $this->getStudentStats($siswa);

        $allBadges = Badge::latest()->get();

        return $allBadges->map(function ($badge) use ($siswa, $earnedIds, $stats) {
            $earned = $earnedIds->contains($badge->id);
            $earnedAt = $earned
                ? StudentBadge::where('siswa_id', $siswa->id)
                    ->where('badge_id', $badge->id)
                    ->value('earned_at')
                : null;

            return [
                'id' => $badge->id,
                'badge_name' => $badge->badge_name,
                'icon' => $badge->icon,
                'description' => $badge->description,
                'conditions' => $badge->conditions,
                'earned' => $earned,
                'condition_met' => $badge->conditions
                    ? $this->evaluateConditions($badge->conditions, $stats)
                    : false,
                'earned_at' => $earnedAt,
            ];
        })->toArray();
    }
}
