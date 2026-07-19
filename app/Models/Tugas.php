<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tugas extends Model
{
    protected $table = 'tugas';
    protected $fillable = ['materi_id', 'judul', 'deskripsi', 'deadline', 'bobot', 'max_revisi'];

    public function materi()
    {
        return $this->belongsTo(Materi::class);
    }

    public function pengumpulan()
    {
        return $this->hasMany(PengumpulanTugas::class);
    }
}
