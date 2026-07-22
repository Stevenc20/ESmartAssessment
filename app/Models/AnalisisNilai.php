<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnalisisNilai extends Model
{
    protected $table = 'analisis_nilai';

    protected $fillable = ['nilai_id', 'kelebihan', 'kekurangan', 'rekomendasi'];

    public function nilaiSiswa()
    {
        return $this->belongsTo(NilaiSiswa::class, 'nilai_id');
    }
}
