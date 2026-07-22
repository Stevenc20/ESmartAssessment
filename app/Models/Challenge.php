<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Challenge extends Model
{
    protected $table = 'challenges';

    protected $fillable = ['judul', 'tema', 'deskripsi', 'deadline', 'point_reward'];

    public function submissions()
    {
        return $this->hasMany(ChallengeSubmission::class);
    }

    public function rankings()
    {
        return $this->hasMany(ChallengeRanking::class);
    }
}
