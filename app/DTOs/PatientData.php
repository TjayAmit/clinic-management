<?php

namespace App\DTOs;

use App\Models\Patient;
use Illuminate\Http\Request;

readonly class PatientData
{
    public function __construct(
        public ?string $first_name = null,
        public ?string $last_name = null,
        public ?string $date_of_birth = null,
        public ?string $gender = null,
        public ?string $blood_type = null,
        public ?string $phone = null,
        public ?string $email = null,
        public ?string $address = null,
        public ?string $emergency_contact_name = null,
        public ?string $emergency_contact_phone = null,
        public ?string $allergies = null,
        public ?string $medical_history = null,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            first_name: $request->input('first_name'),
            last_name: $request->input('last_name'),
            date_of_birth: $request->input('date_of_birth'),
            gender: $request->input('gender'),
            blood_type: $request->input('blood_type'),
            phone: $request->input('phone'),
            email: $request->input('email'),
            address: $request->input('address'),
            emergency_contact_name: $request->input('emergency_contact_name'),
            emergency_contact_phone: $request->input('emergency_contact_phone'),
            allergies: $request->input('allergies'),
            medical_history: $request->input('medical_history'),
        );
    }

    public static function fromModel(Patient $patient): self
    {
        return new self(
            first_name: $patient->first_name,
            last_name: $patient->last_name,
            date_of_birth: $patient->date_of_birth?->toDateString(),
            gender: $patient->gender,
            blood_type: $patient->blood_type,
            phone: $patient->phone,
            email: $patient->email,
            address: $patient->address,
            emergency_contact_name: $patient->emergency_contact_name,
            emergency_contact_phone: $patient->emergency_contact_phone,
            allergies: $patient->allergies,
            medical_history: $patient->medical_history,
        );
    }

    public function toArray(): array
    {
        return array_filter(get_object_vars($this), fn ($value) => $value !== null);
    }
}
