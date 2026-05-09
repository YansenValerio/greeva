<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\Order;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Fired saat order berstatus `completed`.
 * Step 6: listener CreatePartnerEarnings akan menangkap event ini.
 */
class OrderCompleted
{
    use Dispatchable, SerializesModels;

    public function __construct(public readonly Order $order) {}
}
