<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Badge extends Model
{
    protected $table = 'badges';

    protected $fillable = ['badge_name', 'icon', 'description'];

    public function siswa(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'student_badges', 'badge_id', 'siswa_id')
            ->withPivot('earned_at');
    }
}
