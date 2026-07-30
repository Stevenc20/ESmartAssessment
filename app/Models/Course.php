<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    protected $fillable = [
        'judul',
        'deskripsi',
        'thumbnail',
        'assign_to_all',
        'class_levels',
        'guru_id',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'assign_to_all' => 'boolean',
            'class_levels' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function guru(): BelongsTo
    {
        return $this->belongsTo(User::class, 'guru_id');
    }

    public function pertemuan(): HasMany
    {
        return $this->hasMany(CoursePertemuan::class, 'course_id')->orderBy('urutan');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(CourseAssignment::class);
    }
}
