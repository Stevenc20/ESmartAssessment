<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pertemuan extends Model
{
    protected $table = 'pertemuan';
    protected $fillable = ['roadmap_id', 'judul', 'urutan', 'tanggal', 'status'];

    protected $casts = [
        'tanggal' => 'date',
    ];

    public function roadmap()
    {
        return $this->belongsTo(Roadmap::class);
    }

    public function materi()
    {
        return $this->hasMany(Materi::class);
    }

    public function qrSessions()
    {
        return $this->hasMany(QrSession::class);
    }

    public function absensi()
    {
        return $this->hasMany(Absensi::class);
    }
}
