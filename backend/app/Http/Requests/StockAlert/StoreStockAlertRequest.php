<?php

declare(strict_types=1);

namespace App\Http\Requests\StockAlert;

use Illuminate\Foundation\Http\FormRequest;

class StoreStockAlertRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'product_variant_id' => ['required', 'integer', 'exists:product_variants,id'],
            'phone'              => ['required', 'string', 'max:20'],
            'email'              => ['nullable', 'email', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'product_variant_id.required' => 'Varian produk wajib dipilih.',
            'product_variant_id.exists'   => 'Varian produk tidak ditemukan.',
            'phone.required'              => 'Nomor WhatsApp wajib diisi.',
            'email.email'                 => 'Format email tidak valid.',
        ];
    }
}
