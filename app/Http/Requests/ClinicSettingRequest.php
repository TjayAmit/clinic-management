<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ClinicSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'clinic_name'                   => ['required', 'string', 'max:255'],
            'owner_name'                    => ['required', 'string', 'max:255'],
            'phone'                         => ['required', 'string', 'digits:10'],
            'email'                         => ['nullable', 'email', 'max:255'],
            'address'                       => ['nullable', 'string'],
            'city'                          => ['nullable', 'string', 'max:255'],
            'open_time'                     => ['nullable', 'date_format:H:i'],
            'close_time'                    => ['nullable', 'date_format:H:i'],
            'open_days'                     => ['nullable', 'array'],
            'open_days.*'                   => ['string', 'in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'],
            'appointment_interval_minutes'  => ['nullable', 'integer', 'min:5', 'max:120'],
            'logo_path'                     => ['nullable', 'string', 'max:255'],
            'timezone'                      => ['nullable', 'string', 'max:100'],
        ];
    }
}
