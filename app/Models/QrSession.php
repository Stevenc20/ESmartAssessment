<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QrSession extends Model
{
    protected $table = 'qr_sessions';

    protected $fillable = ['pertemuan_id', 'token', 'expired_at', 'status'];

    protected $casts = [
        'expired_at' => 'datetime',
    ];

    public function pertemuan()
    {
        return $this->belongsTo(Pertemuan::class);
    }

    public function absensi()
    {
        return $this->hasMany(Absensi::class);
    }
}
