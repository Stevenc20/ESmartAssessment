<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Certificate extends Model
{
    protected $table = 'certificates';
    protected $fillable = ['siswa_id', 'nomor_sertifikat', 'nilai_akhir', 'grade', 'file_pdf', 'issued_at'];

    public function siswa()
    {
        return $this->belongsTo(User::class, 'siswa_id');
    }
}
