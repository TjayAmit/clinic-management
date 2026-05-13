<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DoctorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $doctorId = $this->route('doctor')?->id;

        return [
            'user_id'        => ['required', 'exists:users,id', Rule::unique('doctors', 'user_id')->ignore($doctorId)],
            'specialization' => ['required', 'string', 'max:255'],
            'license_number' => ['required', 'string', 'max:100', Rule::unique('doctors', 'license_number')->ignore($doctorId)],
            'phone'          => ['nullable', 'string', 'max:20'],
            'bio'            => ['nullable', 'string'],
            'is_active'      => ['boolean'],
        ];
    }
}
