<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MateriDiscussion extends Model
{
    protected $table = 'materi_discussions';

    protected $fillable = ['materi_id', 'user_id', 'parent_id', 'pesan'];

    public function materi(): BelongsTo
    {
        return $this->belongsTo(Materi::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(MateriDiscussion::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(MateriDiscussion::class, 'parent_id')->orderBy('created_at', 'asc');
    }
}
