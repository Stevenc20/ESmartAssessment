<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeviceLinkRequest extends Model
{
    protected $table = 'device_link_requests';

    protected $fillable = [
        'token_hash',
        'client_session_id_hash',
        'user_id',
        'status',
        'ip_address',
        'user_agent',
        'expires_at',
        'consumed_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'consumed_at' => 'datetime',
    ];

    public const STATUS_PENDING = 'pending';

    public const STATUS_SCANNED = 'scanned';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_EXPIRED = 'expired';

    public const STATUS_CANCELLED = 'cancelled';

    public const STATUS_CONSUMED = 'consumed';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isTerminal(): bool
    {
        return in_array($this->status, [
            self::STATUS_APPROVED,
            self::STATUS_EXPIRED,
            self::STATUS_CANCELLED,
            self::STATUS_CONSUMED,
        ], true);
    }
}
