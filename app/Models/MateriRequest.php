<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MateriRequest extends Model
{
    protected $table = 'materi_requests';

    protected $fillable = ['siswa_id', 'judul', 'alasan', 'status'];

    public function siswa()
    {
        return $this->belongsTo(User::class, 'siswa_id');
    }
}
