<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('short_description')->nullable();
            $table->string('status', 30)->default('draft');

            // Harga dasar produk — variant bisa override; semua dalam sen
            $table->unsignedBigInteger('price');
            $table->unsignedBigInteger('compare_price')->nullable();

            $table->json('images')->nullable();
            $table->unsignedInteger('weight')->nullable(); // gram
            $table->string('material')->nullable();
            $table->text('sustainability_notes')->nullable();
            $table->string('meta_title')->nullable();
            $table->string('meta_description')->nullable();

            // Snapshot % bagi hasil dari partner saat produk dibuat
            $table->unsignedTinyInteger('revenue_share_percent');

            $table->timestamp('published_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['status', 'partner_id']);
            $table->index('published_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
