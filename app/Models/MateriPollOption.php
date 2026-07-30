<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MateriPollOption extends Model
{
    protected $table = 'materi_poll_options';

    protected $fillable = ['poll_id', 'opsi_text', 'urutan'];

    public function poll(): BelongsTo
    {
        return $this->belongsTo(MateriPoll::class, 'poll_id');
    }

    public function votes(): HasMany
    {
        return $this->hasMany(MateriPollVote::class, 'option_id');
    }
}
