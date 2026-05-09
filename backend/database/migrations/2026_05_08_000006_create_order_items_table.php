<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            // Nullable: produk/variant bisa dihapus, tapi data order tetap ada
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('partner_id')->constrained();

            // ── SNAPSHOT — IMMUTABLE SETELAH ORDER DIBUAT ──────────────────
            // Data ini tidak boleh berubah walau produk/mitra diupdate
            $table->string('product_name');
            $table->string('variant_name')->nullable();
            $table->string('sku')->nullable();
            $table->string('product_image')->nullable();

            $table->unsignedBigInteger('unit_price');            // harga per item, sen
            $table->unsignedInteger('quantity');
            $table->unsignedBigInteger('subtotal');              // unit_price × qty, sen
            $table->unsignedTinyInteger('revenue_share_percent'); // % bagi hasil saat order
            $table->unsignedBigInteger('partner_earning_amount'); // earning mitra, sen
            // ── END SNAPSHOT ───────────────────────────────────────────────

            $table->timestamps();

            $table->index('order_id');
            $table->index('partner_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
