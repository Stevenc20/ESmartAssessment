<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgressMateri extends Model
{
    protected $table = 'progress_materi';
    protected $fillable = ['siswa_id', 'materi_id', 'status', 'completed_at'];

    public function siswa()
    {
        return $this->belongsTo(User::class, 'siswa_id');
    }

    public function materi()
    {
        return $this->belongsTo(Materi::class);
    }
}
