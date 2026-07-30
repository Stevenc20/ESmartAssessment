<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseProgress extends Model
{
    protected $table = 'course_progress';

    protected $fillable = [
        'siswa_id',
        'pertemuan_id',
        'completed_at',
        'quiz_score',
        'quiz_attempts',
    ];

    protected function casts(): array
    {
        return [
            'completed_at' => 'datetime',
            'quiz_score' => 'decimal:2',
        ];
    }

    public function siswa(): BelongsTo
    {
        return $this->belongsTo(User::class, 'siswa_id');
    }

    public function pertemuan(): BelongsTo
    {
        return $this->belongsTo(CoursePertemuan::class, 'pertemuan_id');
    }
}
