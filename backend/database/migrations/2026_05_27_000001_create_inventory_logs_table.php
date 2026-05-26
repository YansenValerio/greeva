<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_variant_id')->constrained()->cascadeOnDelete();
            // Nullable: produk bisa dihapus, log stok tetap dipertahankan
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            // Denormalisasi untuk filter cepat per mitra
            $table->foreignId('partner_id')->constrained();
            // Referensi order (untuk reason sale/release); null untuk perubahan manual
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            // Siapa yang memicu perubahan (admin/mitra); null untuk perubahan otomatis sistem
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            $table->integer('change');        // signed: + bertambah, - berkurang
            $table->integer('stock_before');
            $table->integer('stock_after');
            $table->string('reason');         // App\Enums\InventoryReason
            $table->string('note')->nullable();

            $table->timestamp('created_at')->useCurrent();

            $table->index(['partner_id', 'created_at']);
            $table->index(['product_variant_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_logs');
    }
};
