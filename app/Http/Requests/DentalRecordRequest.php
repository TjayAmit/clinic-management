<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DentalRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patient_visit_id' => ['nullable', 'exists:patient_visits,id'],
            'patient_id'       => ['required', 'exists:patients,id'],
            'dentist_id'       => ['required', 'exists:doctors,id'],
            'chief_complaint'  => ['required', 'string'],
            'diagnosis'        => ['nullable', 'string'],
            'treatment'        => ['nullable', 'string'],
            'prescription'     => ['nullable', 'string'],
            'notes'            => ['nullable', 'string'],
        ];
    }
}
