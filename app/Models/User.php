<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

#[Fillable(['google_id', 'name', 'email', 'password', 'role_id', 'foto', 'no_hp', 'kelas', 'jurusan', 'status'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    protected $table = 'users';
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(UserLog::class);
    }

    public function kelas()
    {
        return $this->belongsToMany(Kelas::class, 'siswa_kelas', 'siswa_id', 'kelas_id')
            ->withPivot(['tanggal_masuk', 'tanggal_keluar']);
    }

    public function progressMateri(): HasMany
    {
        return $this->hasMany(ProgressMateri::class, 'siswa_id');
    }

    public function pengumpulanTugas(): HasMany
    {
        return $this->hasMany(PengumpulanTugas::class, 'siswa_id');
    }

    public function absensi(): HasMany
    {
        return $this->hasMany(Absensi::class, 'siswa_id');
    }

    public function nilaiSiswa(): HasMany
    {
        return $this->hasMany(NilaiSiswa::class, 'siswa_id');
    }

    public function portfolio(): HasMany
    {
        return $this->hasMany(Portfolio::class, 'siswa_id');
    }

    public function challengeSubmissions(): HasMany
    {
        return $this->hasMany(ChallengeSubmission::class, 'siswa_id');
    }

    public function studentPoints(): HasMany
    {
        return $this->hasMany(StudentPoint::class, 'siswa_id');
    }

    public function studentBadges(): BelongsToMany
    {
        return $this->belongsToMany(Badge::class, 'student_badges', 'siswa_id', 'badge_id')
            ->withPivot('earned_at');
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class, 'siswa_id');
    }

    public function materiRequests(): HasMany
    {
        return $this->hasMany(MateriRequest::class, 'siswa_id');
    }
}
