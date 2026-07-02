<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100', 'regex:/^[a-zA-ZÀ-ÿ\s\'\-]+$/u'],
            'middle_name' => ['nullable', 'string', 'max:100', 'regex:/^[a-zA-ZÀ-ÿ\s\'\-]+$/u'],
            'last_name' => ['required', 'string', 'max:100', 'regex:/^[a-zA-ZÀ-ÿ\s\'\-]+$/u'],
            'date_of_birth' => ['required', 'date', 'before:today'],
            'gender' => ['required', 'in:male,female,other'],
            'civil_status' => ['nullable', 'string', 'in:single,married,divorced,widowed,separated'],
            'occupation' => ['nullable', 'string', 'max:100'],
            'nationality' => ['nullable', 'string', 'max:100'],
            'blood_type' => ['nullable', 'string', 'max:5'],
            'phone' => ['required', 'string', 'size:10', 'regex:/^[1-9][0-9]{9}$/'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'street_address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'province' => ['nullable', 'string', 'max:100'],
            'emergency_contact_name' => ['nullable', 'string', 'max:100', 'regex:/^[a-zA-ZÀ-ÿ\s\'\-]+$/u'],
            'emergency_contact_relationship' => ['nullable', 'string', 'max:50'],
            'emergency_contact_phone' => ['nullable', 'string', 'size:10', 'regex:/^[1-9][0-9]{9}$/'],
            'allergies' => ['nullable', 'string', 'max:1000'],
            'medical_history' => ['nullable', 'string', 'max:2000'],
            'is_regular' => ['nullable', 'boolean'],
        ];
    }
}
