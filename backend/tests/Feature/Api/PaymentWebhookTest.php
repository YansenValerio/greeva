<?php

declare(strict_types=1);

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Partner;
use App\Models\ProductVariant;
use App\Services\Payment\MidtransService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function fakeWebhookPayload(string $orderNumber, string $status, string $fraudStatus = 'accept'): array
{
    return [
        'order_id'            => $orderNumber,
        'status_code'         => '200',
        'gross_amount'        => '85000.00',
        'transaction_status'  => $status,
        'fraud_status'        => $fraudStatus,
        'payment_type'        => 'bank_transfer',
        'signature_key'       => 'valid-signature',
    ];
}

beforeEach(function () {
    $this->midtransMock = $this->mock(MidtransService::class);
    $this->midtransMock->shouldReceive('verifyWebhook')->andReturn(true)->byDefault();
});

it('marks order as paid on settlement webhook', function () {
    $order = Order::factory()->create(['status' => OrderStatus::PendingPayment]);

    $this->midtransMock->shouldReceive('isPaymentSuccess')->andReturn(true);
    $this->midtransMock->shouldReceive('isPaymentFailed')->andReturn(false);

    $this->postJson('/api/v1/payment/webhook', fakeWebhookPayload($order->order_number, 'settlement'))
        ->assertOk()
        ->assertJson(['message' => 'OK']);

    expect($order->fresh()->status)->toBe(OrderStatus::Paid)
        ->and($order->fresh()->paid_at)->not->toBeNull();
});

it('marks order as payment_failed on expired webhook and restores stock', function () {
    $partner = Partner::factory()->create();
    $variant = ProductVariant::factory()
        ->for(\App\Models\Product::factory()->for($partner)->for(\App\Models\Category::factory()))
        ->create(['stock' => 5]);

    $order = Order::factory()->create(['status' => OrderStatus::PendingPayment]);
    OrderItem::factory()->for($order)->for($partner)->create([
        'product_variant_id' => $variant->id,
        'quantity'           => 2,
    ]);

    $this->midtransMock->shouldReceive('isPaymentSuccess')->andReturn(false);
    $this->midtransMock->shouldReceive('isPaymentFailed')->andReturn(true);

    $this->postJson('/api/v1/payment/webhook', fakeWebhookPayload($order->order_number, 'expire'))
        ->assertOk();

    expect($order->fresh()->status)->toBe(OrderStatus::PaymentFailed)
        ->and(ProductVariant::find($variant->id)->stock)->toBe(7); // 5 + 2 dikembalikan
});

it('is idempotent — ignores webhook for already-paid order', function () {
    $order = Order::factory()->paid()->create();

    $this->midtransMock->shouldReceive('isPaymentSuccess')->andReturn(true);

    $this->postJson('/api/v1/payment/webhook', fakeWebhookPayload($order->order_number, 'settlement'))
        ->assertOk();

    // Status tidak berubah
    expect($order->fresh()->status)->toBe(OrderStatus::Paid);
});

it('returns 400 for invalid signature', function () {
    $this->midtransMock->shouldReceive('verifyWebhook')->andReturn(false);

    $this->postJson('/api/v1/payment/webhook', ['order_id' => 'GRV-20260508-0001'])
        ->assertStatus(400);
});
