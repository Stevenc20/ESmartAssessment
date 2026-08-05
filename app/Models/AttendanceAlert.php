<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceAlert extends Model
{
    protected $table = 'attendance_alerts';

    protected $fillable = ['siswa_id', 'roadmap_id', 'persentase', 'sent_at'];

    protected $casts = [
        'persentase' => 'float',
        'sent_at' => 'datetime',
    ];

    public function siswa()
    {
        return $this->belongsTo(User::class, 'siswa_id');
    }

    public function roadmap()
    {
        return $this->belongsTo(Roadmap::class);
    }
}
