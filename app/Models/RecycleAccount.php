<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RecycleAccount extends Model
{
    protected $table = 'recycle_accounts';

    protected $fillable = ['siswa_id', 'archived_at', 'restored_at'];

    public function siswa()
    {
        return $this->belongsTo(User::class, 'siswa_id');
    }
}
