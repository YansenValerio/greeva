<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();          // disimpan UPPERCASE
            $table->string('description')->nullable();      // label admin

            $table->string('type', 20);                     // percent | fixed
            $table->unsignedBigInteger('value');            // persen 1–100, atau nominal sen
            $table->unsignedBigInteger('max_discount')->nullable(); // cap utk percent (sen)
            $table->unsignedBigInteger('min_purchase')->default(0); // min subtotal (sen)

            $table->timestamp('valid_from')->nullable();
            $table->timestamp('valid_until')->nullable();

            $table->unsignedInteger('usage_limit')->nullable();    // kuota total (null = tak terbatas)
            $table->unsignedInteger('per_user_limit')->nullable(); // batas per user
            $table->boolean('first_order_only')->default(false);   // eligibility pelanggan baru
            $table->boolean('is_active')->default(true);

            $table->softDeletes();
            $table->timestamps();

            $table->index(['is_active', 'valid_until']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};
