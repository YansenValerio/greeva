<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payout_batches', function (Blueprint $table) {
            $table->id();
            $table->string('payout_number', 30)->unique(); // PYT-YYYYMMDD-XXX
            $table->foreignId('partner_id')->constrained();
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 20)->default('pending');
            $table->unsignedBigInteger('total_amount');  // sen
            $table->unsignedInteger('item_count');
            $table->date('period_start');
            $table->date('period_end');
            $table->string('payment_proof')->nullable(); // Cloudinary URL bukti transfer
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['partner_id', 'status']);
            $table->index('period_start');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payout_batches');
    }
};
