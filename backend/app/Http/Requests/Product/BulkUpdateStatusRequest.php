<?php

declare(strict_types=1);

namespace App\Http\Requests\Product;

use App\Enums\ProductStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class BulkUpdateStatusRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'product_ids'   => ['required', 'array', 'min:1', 'max:100'],
            'product_ids.*' => ['integer', 'exists:products,id'],
            'status'        => ['required', new Enum(ProductStatus::class)],
            'note'          => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'product_ids.required' => 'Pilih minimal satu produk.',
            'product_ids.max'      => 'Maksimal 100 produk per aksi.',
            'status.required'      => 'Status produk wajib diisi.',
        ];
    }
}
