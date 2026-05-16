<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patient_id' => ['required', 'exists:patients,id'],
            'doctor_id' => ['required', 'exists:doctors,id'],
            'service_id' => ['required', 'exists:services,id'],
            'appointment_date' => ['required', 'date', 'after_or_equal:today'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'notes' => ['nullable', 'string'],
            'is_walk_in' => ['boolean'],
            'teeth_involved' => ['nullable', 'array'],
            'teeth_involved.*' => ['integer', 'between:1,32'],
            'parent_appointment_id' => ['nullable', 'exists:appointments,id'],
            'series_total' => ['nullable', 'integer', 'min:1'],
            'series_position' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
