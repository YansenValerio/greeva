<?php

declare(strict_types=1);

namespace App\Http\Requests\Return;

use Illuminate\Foundation\Http\FormRequest;

class ResolveReturnRequest extends FormRequest
{
    public function rules(): array
    {
        // 'reject' wajib alasan; 'approve' opsional. Route tidak diberi nama,
        // jadi cocokkan berdasarkan path URL.
        $isReject = $this->is('*reject');

        return [
            'admin_note' => [$isReject ? 'required' : 'nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'admin_note.required' => 'Alasan penolakan wajib diisi.',
            'admin_note.max'      => 'Catatan maksimal 1000 karakter.',
        ];
    }
}
