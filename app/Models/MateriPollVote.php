<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MateriPollVote extends Model
{
    protected $table = 'materi_poll_votes';

    protected $fillable = ['poll_id', 'option_id', 'siswa_id'];

    public function poll(): BelongsTo
    {
        return $this->belongsTo(MateriPoll::class, 'poll_id');
    }

    public function option(): BelongsTo
    {
        return $this->belongsTo(MateriPollOption::class, 'option_id');
    }

    public function siswa(): BelongsTo
    {
        return $this->belongsTo(User::class, 'siswa_id');
    }
}
