<?php

declare(strict_types=1);

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'category_id'          => ['sometimes', 'integer', 'exists:categories,id'],
            'name'                 => ['sometimes', 'string', 'max:255'],
            'description'          => ['sometimes', 'string'],
            'short_description'    => ['nullable', 'string', 'max:500'],
            'price'                => ['sometimes', 'integer', 'min:1'],
            'compare_price'        => ['nullable', 'integer', 'min:1'],
            'weight'               => ['sometimes', 'integer', 'min:1'],
            'material'             => ['nullable', 'string', 'max:255'],
            'sustainability_notes' => ['nullable', 'string'],
            'meta_title'           => ['nullable', 'string', 'max:255'],
            'meta_description'     => ['nullable', 'string', 'max:500'],
            'images'               => ['nullable', 'array', 'max:10'],
            'images.*'             => ['string', 'url'],
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.exists' => 'Kategori tidak ditemukan.',
            'price.min'          => 'Harga produk tidak valid.',
            'weight.min'         => 'Berat produk minimal 1 gram.',
        ];
    }
}
