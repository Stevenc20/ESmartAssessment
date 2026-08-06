<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Materi extends Model
{
    protected $table = 'materi';

    protected $fillable = ['pertemuan_id', 'judul', 'thumbnail', 'deskripsi', 'konten', 'video_url', 'pdf_file', 'drive_link', 'created_by', 'tingkat'];

    public function pertemuan()
    {
        return $this->belongsTo(Pertemuan::class);
    }

    public function tugas()
    {
        return $this->hasMany(Tugas::class);
    }

    public function progress()
    {
        return $this->hasMany(ProgressMateri::class);
    }

    public function quiz()
    {
        return $this->hasMany(MateriQuiz::class)->orderBy('urutan');
    }

    public function poll()
    {
        return $this->hasOne(MateriPoll::class, 'materi_id');
    }

    public function folders()
    {
        return $this->hasMany(MateriFolder::class);
    }

    public function files()
    {
        return $this->hasMany(MateriFile::class);
    }

    public function discussions()
    {
        return $this->hasMany(MateriDiscussion::class, 'materi_id')->whereNull('parent_id')->with(['user', 'replies.user'])->latest();
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
