<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TahunAjaran extends Model
{
    protected $table = 'tahun_ajaran';

    protected $fillable = ['tahun', 'status'];

    public function kelas()
    {
        return $this->hasMany(Kelas::class);
    }
}
