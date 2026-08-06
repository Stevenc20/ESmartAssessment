<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MateriFile extends Model
{
    protected $table = 'materi_files';

    protected $fillable = ['materi_id', 'nama', 'path', 'size'];

    public function materi()
    {
        return $this->belongsTo(Materi::class);
    }
}
