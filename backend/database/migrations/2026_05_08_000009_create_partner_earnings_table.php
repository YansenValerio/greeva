<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partner_earnings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_id')->constrained();
            $table->foreignId('order_id')->constrained();
            $table->foreignId('order_item_id')->constrained();
            // Null = belum masuk batch payout
            $table->foreignId('payout_batch_id')->nullable()->constrained()->nullOnDelete();

            $table->unsignedBigInteger('amount'); // sen, copy dari order_item.partner_earning_amount
            $table->string('status', 20)->default('pending');

            // Timestamp lifecycle cooling period & payout
            $table->timestamp('order_completed_at');         // kapan order completed (T=0 cooling)
            $table->timestamp('available_at')->nullable();   // T+7 hari (siap payout)
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('reversed_at')->nullable();
            $table->string('reversal_reason')->nullable();

            $table->softDeletes();
            $table->timestamps();

            $table->unique('order_item_id'); // 1 earning per order_item
            $table->index(['partner_id', 'status']);
            $table->index('available_at');
            $table->index('payout_batch_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partner_earnings');
    }
};
