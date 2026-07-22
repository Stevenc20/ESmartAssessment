<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CertificateTemplate extends Model
{
    protected $table = 'certificate_templates';

    protected $fillable = [
        'nama_template',
        'logo_path',
        'ttd_path',
        'background_path',
        'nama_sekolah',
        'keterangan',
        'config',
        'is_default',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'config' => 'json',
        'is_default' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
