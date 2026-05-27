<?php

declare(strict_types=1);

namespace App\Services\Shipping;

/**
 * Satu opsi tarif pengiriman. `cost` dalam SEN rupiah.
 */
class ShippingRate
{
    public function __construct(
        public readonly string $courierCode,
        public readonly string $courierName,
        public readonly string $serviceCode,
        public readonly string $serviceName,
        public readonly string $etd,
        public readonly int $cost, // sen
    ) {}

    /** Identitas unik kurir+layanan untuk pencocokan saat checkout */
    public function key(): string
    {
        return "{$this->courierCode}:{$this->serviceCode}";
    }

    public function toArray(): array
    {
        return [
            'courier_code' => $this->courierCode,
            'courier_name' => $this->courierName,
            'service_code' => $this->serviceCode,
            'service_name' => $this->serviceName,
            'etd'          => $this->etd,
            'cost'         => $this->cost,
        ];
    }
}
