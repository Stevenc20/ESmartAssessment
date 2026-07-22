<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Portfolio extends Model
{
    protected $table = 'portfolio';

    protected $fillable = ['siswa_id', 'kategori', 'judul', 'deskripsi', 'file_karya'];

    public function siswa()
    {
        return $this->belongsTo(User::class, 'siswa_id');
    }

    public function likes()
    {
        return $this->hasMany(PortfolioLike::class);
    }

    public function comments()
    {
        return $this->hasMany(PortfolioComment::class);
    }

    public function saves()
    {
        return $this->hasMany(PortfolioSave::class);
    }
}
