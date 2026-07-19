<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BackupController extends Controller
{
    protected string $disk = 'local';

    protected string $path = 'backups';

    public function index()
    {
        $backups = [];
        $storage = Storage::disk($this->disk);

        if ($storage->exists($this->path)) {
            $files = $storage->files($this->path);
            rsort($files);

            foreach (array_slice($files, 0, 30) as $file) {
                $backups[] = [
                    'filename' => basename($file),
                    'size' => $this->formatSize($storage->size($file)),
                    'created_at' => date('Y-m-d H:i:s', $storage->lastModified($file)),
                ];
            }
        }

        return Inertia::render('admin/backup/index', ['backups' => $backups]);
    }

    public function generate()
    {
        try {
            Artisan::call('backup:run', ['--only-db' => true]);
            $output = Artisan::output();

            return back()->with('success', 'Backup database berhasil dibuat.');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal membuat backup: ' . $e->getMessage());
        }
    }

    public function download(string $filename)
    {
        $storage = Storage::disk($this->disk);

        if (! $storage->exists($this->path . '/' . $filename)) {
            return back()->with('error', 'File backup tidak ditemukan.');
        }

        return $storage->download($this->path . '/' . $filename);
    }

    protected function formatSize(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;

        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }
}
