<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemAnalytic extends Model
{
    protected $table = 'system_analytics';

    protected $fillable = [
        'date',
        'total_users',
        'total_siswa',
        'total_guru',
        'total_admin',
        'total_materi',
        'total_challenge',
        'total_certificate',
        'total_login',
        'total_upload_tugas',
        'total_materi_baru',
        'total_challenge_baru',
        'attendance_by_kelas',
        'additional_stats',
    ];

    protected $casts = [
        'date' => 'date',
        'attendance_by_kelas' => 'json',
        'additional_stats' => 'json',
    ];
}
