<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\PayoutStatus;
use App\Models\Partner;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PayoutBatchFactory extends Factory
{
    public function definition(): array
    {
        $start = now()->subDays(30);
        $end   = now()->subDays(16);

        return [
            'payout_number' => 'PYT-' . now()->format('Ymd') . '-' . str_pad((string) random_int(1, 999), 3, '0', STR_PAD_LEFT),
            'partner_id'    => Partner::factory(),
            'processed_by'  => null,
            'status'        => PayoutStatus::Pending,
            'total_amount'  => 0,
            'item_count'    => 0,
            'period_start'  => $start,
            'period_end'    => $end,
        ];
    }
}
