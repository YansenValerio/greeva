<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatus;
use App\Events\OrderPaid;
use App\Events\OrderPaymentFailed;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Payment\MidtransService;
use App\Support\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(
        private readonly MidtransService $midtransService,
    ) {}

    /**
     * POST /api/v1/payment/webhook
     * Endpoint publik untuk notifikasi dari Midtrans.
     * Idempotent — aman jika dikirim berulang kali.
     */
    public function handle(Request $request): JsonResponse
    {
        $notification = $request->all();

        // Verifikasi signature Midtrans
        if (! $this->midtransService->verifyWebhook($notification)) {
            return response()->json(['message' => 'Invalid signature.'], 400);
        }

        $orderNumber = $notification['order_id'] ?? '';
        $order       = Order::where('order_number', $orderNumber)->first();

        if (! $order) {
            // Kembalikan 200 agar Midtrans tidak retry
            return response()->json(['message' => 'OK']);
        }

        // Idempotency: jika sudah bukan pending_payment, abaikan
        if ($order->status !== OrderStatus::PendingPayment) {
            return response()->json(['message' => 'OK']);
        }

        if ($this->midtransService->isPaymentSuccess($notification)) {
            $order->update([
                'status'         => OrderStatus::Paid,
                'payment_method' => $notification['payment_type'] ?? null,
                'paid_at'        => now(),
            ]);

            AuditLogger::log(
                'status_changed',
                $order,
                ['status' => 'pending_payment'],
                ['status' => 'paid', 'payment_type' => $notification['payment_type'] ?? null],
            );

            event(new OrderPaid($order));

        } elseif ($this->midtransService->isPaymentFailed($notification)) {
            $order->update(['status' => OrderStatus::PaymentFailed]);

            AuditLogger::log(
                'status_changed',
                $order,
                ['status' => 'pending_payment'],
                ['status' => 'payment_failed', 'transaction_status' => $notification['transaction_status']],
            );

            event(new OrderPaymentFailed($order));
        }

        return response()->json(['message' => 'OK']);
    }
}
