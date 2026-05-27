<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\ProductRestocked;
use App\Models\StockAlert;
use App\Services\Notification\WhatsAppService;
use App\Support\Money;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendStockAlertNotifications implements ShouldQueue
{
    use InteractsWithQueue;

    public int $tries   = 3;
    public int $backoff = 60;

    public function __construct(private readonly WhatsAppService $whatsApp) {}

    public function handle(ProductRestocked $event): void
    {
        $variant = $event->variant->loadMissing('product');
        $product = $variant->product;

        if ($product === null) {
            return;
        }

        StockAlert::pending()
            ->where('product_variant_id', $variant->id)
            ->get()
            ->each(function (StockAlert $alert) use ($variant, $product) {
                $this->whatsApp->send(
                    $alert->phone,
                    $this->message($product->name, $variant->name, $variant->effectivePrice(), $product->slug),
                );

                $alert->update(['notified_at' => now()]);
            });
    }

    private function message(string $productName, string $variantName, int $priceCents, string $slug): string
    {
        $price = Money::format($priceCents);
        $url   = rtrim((string) config('app.frontend_url', config('app.url')), '/') . "/products/{$slug}";

        return <<<MSG
        Kabar baik! 🌿

        *{$productName}* ({$variantName}) yang kamu tunggu sudah *tersedia kembali* di Greeva.

        Harga: {$price}

        Buruan checkout sebelum kehabisan lagi:
        {$url}

        _Greeva · Sustainable brands deserve better marketing._
        MSG;
    }
}
