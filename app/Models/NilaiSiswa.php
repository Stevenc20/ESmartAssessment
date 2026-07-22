<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NilaiSiswa extends Model
{
    protected $table = 'nilai_siswa';

    protected $fillable = [
        'siswa_id', 'periode', 'nilai_kehadiran', 'nilai_materi',
        'nilai_tugas', 'nilai_karya', 'nilai_portfolio',
        'nilai_keaktifan', 'nilai_akhir', 'grade',
    ];

    public function siswa()
    {
        return $this->belongsTo(User::class, 'siswa_id');
    }

    public function analisis()
    {
        return $this->hasOne(AnalisisNilai::class, 'nilai_id');
    }
}
