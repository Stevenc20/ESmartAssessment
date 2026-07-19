<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Roadmap extends Model
{
    protected $table = 'roadmaps';
    protected $fillable = ['judul', 'bulan', 'tahun', 'deskripsi', 'created_by'];

    public function pertemuan()
    {
        return $this->hasMany(Pertemuan::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
