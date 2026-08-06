<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MateriFolder extends Model
{
    protected $table = 'materi_folders';

    protected $fillable = ['materi_id', 'nama', 'file_count', 'total_size'];

    public function materi()
    {
        return $this->belongsTo(Materi::class);
    }
}
