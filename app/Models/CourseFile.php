<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseFile extends Model
{
    protected $table = 'course_files';

    protected $fillable = [
        'pertemuan_id',
        'nama_file',
        'file_path',
        'urutan',
    ];

    public function pertemuan(): BelongsTo
    {
        return $this->belongsTo(CoursePertemuan::class, 'pertemuan_id');
    }
}
