<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class PengumpulanTugas extends Model
{
    protected $table = 'pengumpulan_tugas';

    protected $fillable = ['tugas_id', 'siswa_id', 'file_tugas', 'revisi_ke', 'submitted_at'];

    protected $appends = ['files_list', 'file_url'];

    public function tugas()
    {
        return $this->belongsTo(Tugas::class);
    }

    public function siswa()
    {
        return $this->belongsTo(User::class, 'siswa_id');
    }

    public function penilaian()
    {
        return $this->hasOne(PenilaianTugas::class, 'pengumpulan_id');
    }

    public function getFilesListAttribute(): array
    {
        if (empty($this->file_tugas)) {
            return [];
        }

        $decoded = json_decode($this->file_tugas, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return array_map(function ($item) {
                if (is_string($item)) {
                    $ext = strtolower(pathinfo($item, PATHINFO_EXTENSION));
                    return [
                        'path' => $item,
                        'name' => basename($item),
                        'size' => null,
                        'ext' => $ext,
                        'url' => Storage::url($item),
                    ];
                }

                $path = $item['path'] ?? '';
                $name = $item['name'] ?? basename($path);
                $ext = $item['ext'] ?? strtolower(pathinfo($name, PATHINFO_EXTENSION));

                return [
                    'path' => $path,
                    'name' => $name,
                    'size' => $item['size'] ?? null,
                    'ext' => $ext,
                    'url' => ! empty($path) ? Storage::url($path) : '',
                ];
            }, $decoded);
        }

        $ext = strtolower(pathinfo($this->file_tugas, PATHINFO_EXTENSION));

        return [
            [
                'path' => $this->file_tugas,
                'name' => basename($this->file_tugas),
                'size' => null,
                'ext' => $ext,
                'url' => Storage::url($this->file_tugas),
            ],
        ];
    }

    public function getFileUrlAttribute(): ?string
    {
        $files = $this->files_list;
        return ! empty($files) ? ($files[0]['url'] ?? null) : null;
    }
}
