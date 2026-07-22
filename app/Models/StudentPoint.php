<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentPoint extends Model
{
    protected $table = 'student_points';

    protected $fillable = ['siswa_id', 'point', 'source'];

    public function siswa()
    {
        return $this->belongsTo(User::class, 'siswa_id');
    }
}
