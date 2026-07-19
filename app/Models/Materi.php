<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Materi extends Model
{
    protected $table = 'materi';
    protected $fillable = ['pertemuan_id', 'judul', 'thumbnail', 'deskripsi', 'video_url', 'pdf_file', 'drive_link', 'created_by'];

    public function pertemuan()
    {
        return $this->belongsTo(Pertemuan::class);
    }

    public function tugas()
    {
        return $this->hasMany(Tugas::class);
    }

    public function progress()
    {
        return $this->hasMany(ProgressMateri::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
