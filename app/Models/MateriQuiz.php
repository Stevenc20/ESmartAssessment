<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MateriQuiz extends Model
{
    protected $table = 'materi_quiz';

    protected $fillable = [
        'materi_id',
        'soal',
        'gambar',
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

    public function materi(): BelongsTo
    {
        return $this->belongsTo(Materi::class);
    }
}
