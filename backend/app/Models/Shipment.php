<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ShipmentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Shipment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'order_id',
        'partner_id',
        'tracking_number',
        'courier',
        'courier_service',
        'shipping_cost',
        'status',
        'packed_at',
        'shipped_at',
        'delivered_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'status'        => ShipmentStatus::class,
            'shipping_cost' => 'integer', // sen
            'packed_at'     => 'datetime',
            'shipped_at'    => 'datetime',
            'delivered_at'  => 'datetime',
        ];
    }

    // ── Relationships ────────────────────────────────────────────────────────

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }
}
