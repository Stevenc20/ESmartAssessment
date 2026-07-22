<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ErrorLog extends Model
{
    protected $table = 'error_logs';

    protected $fillable = [
        'level',
        'message',
        'file',
        'line',
        'context',
        'ip_address',
        'user_id',
        'route',
        'method',
        'occurred_at',
    ];

    protected $casts = [
        'context' => 'json',
        'occurred_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
