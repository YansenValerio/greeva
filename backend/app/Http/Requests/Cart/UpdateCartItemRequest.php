<?php

declare(strict_types=1);

namespace App\Http\Requests\Cart;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCartItemRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'quantity' => ['required', 'integer', 'min:0', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'quantity.required' => 'Jumlah item wajib diisi.',
            'quantity.min'      => 'Jumlah tidak boleh negatif.',
            'quantity.max'      => 'Jumlah maksimal 100 per item.',
        ];
    }
}
