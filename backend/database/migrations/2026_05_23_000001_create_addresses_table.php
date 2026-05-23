<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->string('label', 50)->nullable();          // mis. "Rumah", "Kantor"
            $table->string('recipient_name');
            $table->string('phone', 20);
            $table->text('address');
            $table->string('province', 100);
            $table->string('city', 100);
            $table->string('district', 100)->nullable();
            $table->string('postal_code', 10);
            $table->boolean('is_default')->default(false);
            $table->softDeletes();
            $table->timestamps();

            $table->index(['user_id', 'is_default']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('addresses');
    }
};
