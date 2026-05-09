<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\OrderPaid;
use App\Models\Order;
use App\Models\Partner;
use App\Services\Notification\WhatsAppService;
use App\Support\Money;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendOrderPaidNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public int $tries  = 3;
    public int $backoff = 60;

    public function __construct(private readonly WhatsAppService $whatsApp) {}

    public function handle(OrderPaid $event): void
    {
        $order = $event->order->loadMissing('items');

        // Notify buyer at shipping phone
        $this->whatsApp->send(
            $order->shipping_phone,
            $this->buyerMessage($order),
        );

        // Notify each partner — so they know to start packing
        $partnerIds = $order->items->pluck('partner_id')->unique();

        Partner::whereIn('id', $partnerIds)
            ->with('user:id,phone')
            ->get()
            ->each(function (Partner $partner) use ($order) {
                if ($partner->user?->phone) {
                    $this->whatsApp->send(
                        $partner->user->phone,
                        $this->partnerMessage($order),
                    );
                }
            });
    }

    // ── Messages ─────────────────────────────────────────────────────────────

    private function buyerMessage(Order $order): string
    {
        $total = Money::format($order->grand_total);

        return <<<MSG
        Halo, {$order->shipping_name}! 🌿

        Pembayaran pesanan *#{$order->order_number}* sudah kami terima. Kami segera menyiapkan paketmu!

        Total: {$total}

        Pantau status pesanan di halaman pesananmu.

        _Greeva · Sustainable brands deserve better marketing._
        MSG;
    }

    private function partnerMessage(Order $order): string
    {
        return <<<MSG
        Hei! Ada pesanan baru yang perlu disiapkan.

        Pesanan *#{$order->order_number}* sudah dibayar oleh buyer. Mohon siapkan produk untuk pengiriman.

        _Greeva Partner Notification_
        MSG;
    }
}
