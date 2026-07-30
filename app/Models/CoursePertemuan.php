<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CoursePertemuan extends Model
{
    protected $table = 'course_pertemuan';

    protected $fillable = [
        'course_id',
        'judul',
        'deskripsi',
        'gambar',
        'urutan',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function sections(): HasMany
    {
        return $this->hasMany(CourseSection::class, 'pertemuan_id')->orderBy('urutan');
    }

    public function files(): HasMany
    {
        return $this->hasMany(CourseFile::class, 'pertemuan_id')->orderBy('urutan');
    }

    public function quiz(): HasMany
    {
        return $this->hasMany(CourseQuiz::class, 'pertemuan_id')->orderBy('urutan');
    }

    public function progress(): HasMany
    {
        return $this->hasMany(CourseProgress::class, 'pertemuan_id');
    }
}
