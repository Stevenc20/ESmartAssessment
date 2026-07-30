<?php

namespace App\Services;

use App\Models\Badge;
use App\Models\PengumpulanTugas;
use App\Models\StudentBadge;
use App\Models\StudentPoint;
use App\Models\User;

class BadgeService
{
    public function evaluateForStudent(User $siswa): void
    {
        $earnedBadgeIds = StudentBadge::where('siswa_id', $siswa->id)->pluck('badge_id');

        $available = Badge::whereNotNull('conditions')->whereNotIn('id', $earnedBadgeIds)->get();

        if ($available->isEmpty()) return;

        $stats = $this->getStudentStats($siswa);

        foreach ($available as $badge) {
            if ($this->evaluateConditions($badge->conditions, $stats)) {
                StudentBadge::create([
                    'siswa_id' => $siswa->id,
                    'badge_id' => $badge->id,
                    'earned_at' => now(),
                ]);
            }
        }
    }

    public function getStudentStats(User $siswa): array
    {
        $assessments = PengumpulanTugas::where('siswa_id', $siswa->id)
            ->whereHas('penilaian')
            ->with('penilaian')
            ->get();

        $gradedCount = $assessments->count();
        $avgScore = $gradedCount > 0
            ? round($assessments->avg(fn ($p) => $p->penilaian->nilai), 2)
            : 0;
        $hasPerfect = $assessments->contains(fn ($p) => $p->penilaian->nilai === 100);
        $totalPoints = StudentPoint::where('siswa_id', $siswa->id)->sum('point');

        return [
            'assessment_count' => $gradedCount,
            'assessment_avg_score' => $avgScore,
            'assessment_perfect' => $hasPerfect,
            'points_earned' => $totalPoints,
        ];
    }

    public function evaluateConditions(?array $conditions, array $stats): bool
    {
        if (!$conditions || !isset($conditions['type'])) return false;

        $type = $conditions['type'];
        $operator = $conditions['operator'] ?? '>=';
        $value = $conditions['value'] ?? 0;
        $actual = $stats[$type] ?? null;

        if ($actual === null) return false;

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
