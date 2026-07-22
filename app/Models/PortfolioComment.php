<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PortfolioComment extends Model
{
    protected $table = 'portfolio_comments';

    protected $fillable = ['portfolio_id', 'user_id', 'komentar'];

    public function portfolio()
    {
        return $this->belongsTo(Portfolio::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
