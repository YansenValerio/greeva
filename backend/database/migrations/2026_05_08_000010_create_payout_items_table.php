<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payout_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payout_batch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('partner_earning_id')->constrained();
            $table->unsignedBigInteger('amount'); // sen
            $table->timestamps();

            // Satu earning tidak boleh masuk lebih dari satu batch
            $table->unique(['payout_batch_id', 'partner_earning_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payout_items');
    }
};
