<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PenilaianTugas extends Model
{
    protected $table = 'penilaian_tugas';

    protected $fillable = ['pengumpulan_id', 'guru_id', 'nilai', 'feedback'];

    public function pengumpulan()
    {
        return $this->belongsTo(PengumpulanTugas::class, 'pengumpulan_id');
    }

    public function guru()
    {
        return $this->belongsTo(User::class, 'guru_id');
    }
}
