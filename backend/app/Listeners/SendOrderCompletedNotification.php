<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\OrderCompleted;
use App\Models\Order;
use App\Services\Notification\WhatsAppService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendOrderCompletedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public int $tries  = 3;
    public int $backoff = 60;

    public function __construct(private readonly WhatsAppService $whatsApp) {}

    public function handle(OrderCompleted $event): void
    {
        $this->whatsApp->send(
            $event->order->shipping_phone,
            $this->buyerMessage($event->order),
        );
    }

    private function buyerMessage(Order $order): string
    {
        return <<<MSG
        Halo, {$order->shipping_name}! 🎉

        Pesanan *#{$order->order_number}* kamu sudah selesai. Terima kasih sudah berbelanja di Greeva!

        Setiap pembelian kamu mendukung brand lokal berkelanjutan. Sampai jumpa lagi! 🌿

        _Greeva · Sustainable brands deserve better marketing._
        MSG;
    }
}
