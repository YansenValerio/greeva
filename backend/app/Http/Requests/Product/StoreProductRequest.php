<?php

declare(strict_types=1);

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'category_id'          => ['required', 'integer', 'exists:categories,id'],
            'name'                 => ['required', 'string', 'max:255'],
            'description'          => ['required', 'string'],
            'short_description'    => ['nullable', 'string', 'max:500'],
            'price'                => ['required', 'integer', 'min:1'],   // sen
            'compare_price'        => ['nullable', 'integer', 'min:1'],  // sen
            'weight'               => ['required', 'integer', 'min:1'],  // gram
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
            'category_id.required' => 'Kategori wajib dipilih.',
            'category_id.exists'   => 'Kategori tidak ditemukan.',
            'name.required'        => 'Nama produk wajib diisi.',
            'description.required' => 'Deskripsi produk wajib diisi.',
            'price.required'       => 'Harga produk wajib diisi.',
            'price.min'            => 'Harga produk tidak valid.',
            'weight.required'      => 'Berat produk wajib diisi.',
            'weight.min'           => 'Berat produk minimal 1 gram.',
        ];
    }
}
