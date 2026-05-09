<?php

declare(strict_types=1);

namespace App\Http\Requests\Cart;

use Illuminate\Foundation\Http\FormRequest;

class AddToCartRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'variant_id' => ['required', 'integer', 'exists:product_variants,id'],
            'quantity'   => ['required', 'integer', 'min:1', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'variant_id.required' => 'Varian produk wajib dipilih.',
            'variant_id.exists'   => 'Varian produk tidak ditemukan.',
            'quantity.required'   => 'Jumlah item wajib diisi.',
            'quantity.min'        => 'Jumlah minimal 1.',
            'quantity.max'        => 'Jumlah maksimal 100 per item.',
        ];
    }
}
