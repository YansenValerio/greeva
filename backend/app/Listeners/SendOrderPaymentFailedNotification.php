<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\OrderPaymentFailed;
use App\Models\Order;
use App\Services\Notification\WhatsAppService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendOrderPaymentFailedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public int $tries  = 3;
    public int $backoff = 60;

    public function __construct(private readonly WhatsAppService $whatsApp) {}

    public function handle(OrderPaymentFailed $event): void
    {
        $this->whatsApp->send(
            $event->order->shipping_phone,
            $this->buyerMessage($event->order),
        );
    }

    private function buyerMessage(Order $order): string
    {
        return <<<MSG
        Halo, {$order->shipping_name}.

        Pembayaran untuk pesanan *#{$order->order_number}* tidak berhasil dalam batas waktu yang ditentukan, sehingga pesanan dibatalkan secara otomatis.

        Kamu bisa melakukan pemesanan ulang kapan saja di Greeva. Stok produk akan dikembalikan.

        _Greeva · Sustainable brands deserve better marketing._
        MSG;
    }
}
