<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChallengeSubmission extends Model
{
    protected $table = 'challenge_submissions';
    protected $fillable = ['challenge_id', 'siswa_id', 'file_karya', 'nilai'];

    public function challenge()
    {
        return $this->belongsTo(Challenge::class);
    }

    public function siswa()
    {
        return $this->belongsTo(User::class, 'siswa_id');
    }
}
