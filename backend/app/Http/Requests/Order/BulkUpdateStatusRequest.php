<?php

declare(strict_types=1);

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BulkUpdateStatusRequest extends FormRequest
{
    /**
     * Hanya transisi yang tidak butuh data per-order (mis. resi) yang
     * diizinkan untuk aksi massal. "shipped" butuh nomor resi → dikecualikan.
     */
    private const BULK_ALLOWED_STATUSES = ['packing', 'delivered', 'completed', 'cancelled'];

    public function rules(): array
    {
        return [
            'order_ids'   => ['required', 'array', 'min:1', 'max:100'],
            'order_ids.*' => ['integer', 'exists:orders,id'],
            'status'      => ['required', Rule::in(self::BULK_ALLOWED_STATUSES)],
        ];
    }

    public function messages(): array
    {
        return [
            'order_ids.required' => 'Pilih minimal satu pesanan.',
            'order_ids.max'      => 'Maksimal 100 pesanan per aksi.',
            'status.in'          => 'Status ini tidak bisa diubah secara massal.',
        ];
    }
}
