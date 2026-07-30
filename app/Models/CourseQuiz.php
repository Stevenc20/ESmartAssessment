<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseQuiz extends Model
{
    protected $table = 'course_quiz';

    protected $fillable = [
        'pertemuan_id',
        'soal',
        'opsi',
        'jawaban_benar',
        'urutan',
    ];

    protected function casts(): array
    {
        return [
            'opsi' => 'array',
        ];
    }

    public function pertemuan(): BelongsTo
    {
        return $this->belongsTo(CoursePertemuan::class, 'pertemuan_id');
    }
}
