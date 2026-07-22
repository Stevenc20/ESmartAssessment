<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentBadge extends Model
{
    protected $table = 'student_badges';

    protected $fillable = ['siswa_id', 'badge_id', 'earned_at'];

    public function siswa()
    {
        return $this->belongsTo(User::class, 'siswa_id');
    }

    public function badge()
    {
        return $this->belongsTo(Badge::class);
    }
}
