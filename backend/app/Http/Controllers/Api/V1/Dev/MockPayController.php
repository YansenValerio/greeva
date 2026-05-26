<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Dev;

use App\Enums\OrderStatus;
use App\Events\OrderPaid;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Support\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MockPayController extends Controller
{
    /**
     * POST /api/v1/dev/mock-pay/{orderNumber}
     * Simulasi pembayaran sukses — hanya di local/staging.
     */
    public function __invoke(Request $request, string $orderNumber): JsonResponse
    {
        $order = Order::where('order_number', $orderNumber)
            ->where('user_id', $request->user()->id)
            ->where('status', OrderStatus::PendingPayment)
            ->firstOrFail();

        $order->update([
            'status'         => OrderStatus::Paid,
            'payment_method' => 'mock',
            'paid_at'        => now(),
        ]);

        AuditLogger::log(
            'status_changed',
            $order,
            ['status' => 'pending_payment'],
            ['status' => 'paid', 'payment_type' => 'mock'],
        );

        event(new OrderPaid($order));

        return response()->json(['message' => 'Pembayaran simulasi berhasil.']);
    }
}
