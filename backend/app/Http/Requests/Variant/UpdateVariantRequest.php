<?php

declare(strict_types=1);

namespace App\Http\Requests\Variant;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVariantRequest extends FormRequest
{
    public function rules(): array
    {
        $variantId = $this->route('variant') instanceof \App\Models\ProductVariant
            ? $this->route('variant')->id
            : (int) $this->route('variant');

        return [
            'sku'        => ['sometimes', 'string', 'max:100', "unique:product_variants,sku,{$variantId}"],
            'name'       => ['sometimes', 'string', 'max:255'],
            'price'      => ['nullable', 'integer', 'min:1'],
            'stock'      => ['sometimes', 'integer', 'min:0'],
            'images'     => ['nullable', 'array', 'max:5'],
            'images.*'   => ['string', 'url'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active'  => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'sku.unique' => 'SKU sudah digunakan oleh varian lain.',
            'stock.min'  => 'Stok tidak boleh negatif.',
        ];
    }
}
