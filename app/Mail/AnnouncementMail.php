<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AnnouncementMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $judul,
        public string $isi,
        public string $type = 'info',
        public string $source = 'Pengumuman',
        public ?string $actionUrl = null,
    ) {}

    public function envelope(): Envelope
    {
        $prefix = match ($this->type) {
            'warning' => '⚠️ [Penting]',
            'maintenance' => '🛠️ [Pemeliharaan]',
            default => '📢 [Pengumuman]',
        };

        return new Envelope(
            subject: "{$prefix} {$this->judul} — e-Smart Assessment",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.announcement',
        );
    }
}
