<?php

declare(strict_types=1);

namespace App\Http\Requests\Variant;

use Illuminate\Foundation\Http\FormRequest;

class StoreVariantRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'sku'        => ['required', 'string', 'max:100', 'unique:product_variants,sku'],
            'name'       => ['required', 'string', 'max:255'],
            'price'      => ['nullable', 'integer', 'min:1'],  // null = pakai harga produk
            'stock'      => ['required', 'integer', 'min:0'],
            'images'     => ['nullable', 'array', 'max:5'],
            'images.*'   => ['string', 'url'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active'  => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'sku.required'   => 'SKU varian wajib diisi.',
            'sku.unique'     => 'SKU sudah digunakan oleh varian lain.',
            'name.required'  => 'Nama varian wajib diisi.',
            'stock.required' => 'Stok varian wajib diisi.',
            'stock.min'      => 'Stok tidak boleh negatif.',
        ];
    }
}
