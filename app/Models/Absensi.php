<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Absensi extends Model
{
    protected $table = 'absensi';

    public const STATUS_HADIR = 'hadir';

    public const STATUS_TERLAMBAT = 'terlambat';

    public const STATUS_IZIN = 'izin';

    public const STATUS_SAKIT = 'sakit';

    public const STATUS_ALPA = 'alpa';

    protected $fillable = ['siswa_id', 'pertemuan_id', 'qr_session_id', 'status', 'scan_time'];

    protected $casts = [
        'scan_time' => 'datetime',
    ];

    public function siswa()
    {
        return $this->belongsTo(User::class, 'siswa_id');
    }

    public function pertemuan()
    {
        return $this->belongsTo(Pertemuan::class);
    }

    public function qrSession()
    {
        return $this->belongsTo(QrSession::class);
    }
}
