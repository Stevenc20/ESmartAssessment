<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KomponenPenilaian extends Model
{
    protected $table = 'komponen_penilaian';
    protected $fillable = ['nama_komponen', 'bobot'];
}
