<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MateriPoll extends Model
{
    protected $table = 'materi_polls';

    protected $fillable = ['materi_id', 'pertanyaan', 'is_active'];

    public function materi(): BelongsTo
    {
        return $this->belongsTo(Materi::class);
    }

    public function options(): HasMany
    {
        return $this->hasMany(MateriPollOption::class, 'poll_id')->orderBy('urutan');
    }

    public function votes(): HasMany
    {
        return $this->hasMany(MateriPollVote::class, 'poll_id');
    }
}
