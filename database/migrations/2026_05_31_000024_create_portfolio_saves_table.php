<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('portfolio_saves', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portfolio_id')->constrained('portfolio')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['portfolio_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portfolio_saves');
    }
};
