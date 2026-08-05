<?php

namespace App\Mail;

use App\Models\Roadmap;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AttendanceAlertMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $siswa,
        public Roadmap $roadmap,
        public float $persentase,
        public float $threshold,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Peringatan Kehadiran Rendah — '.$this->roadmap->judul,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.attendance-alert',
        );
    }
}
