<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Kelas extends Model
{
    protected $table = 'kelas';
    protected $fillable = ['nama_kelas', 'tingkat', 'tahun_ajaran_id'];

    public function tahunAjaran(): BelongsTo
    {
        return $this->belongsTo(TahunAjaran::class);
    }

    public function siswa()
    {
        return $this->belongsToMany(User::class, 'siswa_kelas', 'kelas_id', 'siswa_id')
            ->withPivot(['tanggal_masuk', 'tanggal_keluar']);
    }
}
