<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Satu order bisa punya beberapa shipment (satu per mitra)
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('partner_id')->constrained();
            $table->string('tracking_number', 50)->nullable();
            $table->string('courier', 30)->nullable();         // JNE, J&T, SiCepat, dll
            $table->string('courier_service', 50)->nullable(); // REG, OKE, BEST, dll
            $table->unsignedBigInteger('shipping_cost');       // sen
            $table->string('status', 30)->default('pending');
            $table->timestamp('packed_at')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['order_id', 'partner_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
