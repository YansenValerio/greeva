<?php

declare(strict_types=1);

namespace App\Http\Requests\Order;

use App\Enums\OrderStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class AdminUpdateOrderStatusRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'status'          => ['required', new Enum(OrderStatus::class)],
            'tracking_number' => ['required_if:status,shipped', 'nullable', 'string', 'max:100'],
            'courier'         => ['nullable', 'string', 'max:50'],
            'courier_service' => ['nullable', 'string', 'max:50'],
            'note'            => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required'               => 'Status wajib diisi.',
            'tracking_number.required_if'   => 'Nomor resi wajib diisi saat status "Dalam Pengiriman".',
        ];
    }
}
