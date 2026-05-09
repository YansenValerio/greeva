<?php

declare(strict_types=1);

namespace App\Http\Requests\Checkout;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'shipping_name'        => ['required', 'string', 'max:255'],
            'shipping_phone'       => ['required', 'string', 'max:20'],
            'shipping_address'     => ['required', 'string', 'max:1000'],
            'shipping_province'    => ['required', 'string', 'max:100'],
            'shipping_city'        => ['required', 'string', 'max:100'],
            'shipping_district'    => ['nullable', 'string', 'max:100'],
            'shipping_postal_code' => ['required', 'string', 'size:5'],
            'notes'                => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'shipping_name.required'        => 'Nama penerima wajib diisi.',
            'shipping_phone.required'       => 'Nomor telepon penerima wajib diisi.',
            'shipping_address.required'     => 'Alamat pengiriman wajib diisi.',
            'shipping_province.required'    => 'Provinsi wajib diisi.',
            'shipping_city.required'        => 'Kota/Kabupaten wajib diisi.',
            'shipping_postal_code.required' => 'Kode pos wajib diisi.',
            'shipping_postal_code.size'     => 'Kode pos harus 5 digit.',
        ];
    }
}
