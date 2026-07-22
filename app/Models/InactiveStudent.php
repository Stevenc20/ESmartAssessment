<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InactiveStudent extends Model
{
    protected $table = 'inactive_students';

    protected $fillable = ['siswa_id', 'alasan', 'tanggal_nonaktif', 'status'];

    public function siswa()
    {
        return $this->belongsTo(User::class, 'siswa_id');
    }
}
