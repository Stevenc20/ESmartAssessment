<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChallengeRanking extends Model
{
    protected $table = 'challenge_ranking';
    protected $fillable = ['challenge_id', 'siswa_id', 'ranking'];

    public function challenge()
    {
        return $this->belongsTo(Challenge::class);
    }

    public function siswa()
    {
        return $this->belongsTo(User::class, 'siswa_id');
    }
}
