<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Export extends Model
{
    protected $table = 'exports';

    protected $fillable = ['jenis_laporan', 'generated_by', 'file_path'];

    public function generator()
    {
        return $this->belongsTo(User::class, 'generated_by');
    }
}
