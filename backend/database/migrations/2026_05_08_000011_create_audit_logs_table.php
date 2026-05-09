<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Audit trail untuk semua perubahan di entity sensitif:
        // Order, Partner, PayoutBatch, PartnerEarning
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('event', 50);              // created, updated, deleted, status_changed
            $table->string('auditable_type');          // App\Models\Order, dst.
            $table->unsignedBigInteger('auditable_id');
            $table->unsignedBigInteger('user_id')->nullable(); // siapa yang melakukan aksi
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['auditable_type', 'auditable_id']);
            $table->index('user_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
