<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseSection extends Model
{
    protected $table = 'course_section';

    protected $fillable = [
        'pertemuan_id',
        'judul',
        'konten',
        'urutan',
    ];

    public function pertemuan(): BelongsTo
    {
        return $this->belongsTo(CoursePertemuan::class, 'pertemuan_id');
    }
}
