<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendAnnouncementEmails implements ShouldQueue
{
    use Queueable;

    public $judul;
    public $isi;
    public $targetRole;
    public $type;
    public $source;
    public $actionUrl;

    /**
     * Create a new job instance.
     */
    public function __construct($judul, $isi, $targetRole = 'all', $type = 'info', $source = 'Pengumuman', $actionUrl = null)
    {
        $this->judul = $judul;
        $this->isi = $isi;
        $this->targetRole = $targetRole;
        $this->type = $type;
        $this->source = $source;
        $this->actionUrl = $actionUrl;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        app(\App\Services\AnnouncementService::class)->sendEmailNotifications(
            $this->judul,
            $this->isi,
            $this->targetRole,
            $this->type,
            $this->source,
            $this->actionUrl
        );
    }
}
