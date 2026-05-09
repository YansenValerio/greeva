<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 30)->unique(); // GRV-YYYYMMDD-XXXX
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            // Guest checkout fields
            $table->string('guest_email')->nullable();
            $table->string('guest_name')->nullable();
            $table->string('guest_phone', 20)->nullable();

            $table->string('status', 30)->default('pending_payment');

            // Semua nilai uang dalam sen
            $table->unsignedBigInteger('subtotal');
            $table->unsignedBigInteger('shipping_total');
            $table->unsignedBigInteger('discount_total')->default(0);
            $table->unsignedBigInteger('grand_total');

            // Snapshot alamat pengiriman — tidak boleh terpengaruh perubahan profil user
            $table->string('shipping_name');
            $table->string('shipping_phone', 20);
            $table->text('shipping_address');
            $table->string('shipping_province');
            $table->string('shipping_city');
            $table->string('shipping_district')->nullable();
            $table->string('shipping_postal_code', 10);

            // Midtrans
            $table->string('payment_method', 50)->nullable();
            $table->string('payment_token')->nullable();
            $table->string('payment_url')->nullable();

            $table->timestamp('paid_at')->nullable();
            $table->timestamp('payment_expired_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['status', 'completed_at']);
            $table->index('payment_expired_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
