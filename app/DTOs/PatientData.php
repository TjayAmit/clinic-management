<?php

namespace App\DTOs;

use App\Models\Patient;
use Illuminate\Http\Request;

readonly class PatientData
{
    public function __construct(
        public ?string $first_name = null,
        public ?string $middle_name = null,
        public ?string $last_name = null,
        public ?string $date_of_birth = null,
        public ?string $gender = null,
        public ?string $civil_status = null,
        public ?string $occupation = null,
        public ?string $nationality = null,
        public ?string $blood_type = null,
        public ?string $phone = null,
        public ?string $email = null,
        public ?string $address = null,
        public ?string $street_address = null,
        public ?string $city = null,
        public ?string $province = null,
        public ?string $emergency_contact_name = null,
        public ?string $emergency_contact_relationship = null,
        public ?string $emergency_contact_phone = null,
        public ?string $allergies = null,
        public ?string $medical_history = null,
        public ?bool $is_regular = null,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            first_name: $request->input('first_name'),
            middle_name: $request->input('middle_name'),
            last_name: $request->input('last_name'),
            date_of_birth: $request->input('date_of_birth'),
            gender: $request->input('gender'),
            civil_status: $request->input('civil_status'),
            occupation: $request->input('occupation'),
            nationality: $request->input('nationality'),
            blood_type: $request->input('blood_type'),
            phone: $request->input('phone'),
            email: $request->input('email'),
            address: $request->input('address'),
            street_address: $request->input('street_address'),
            city: $request->input('city'),
            province: $request->input('province'),
            emergency_contact_name: $request->input('emergency_contact_name'),
            emergency_contact_relationship: $request->input('emergency_contact_relationship'),
            emergency_contact_phone: $request->input('emergency_contact_phone'),
            allergies: $request->input('allergies'),
            medical_history: $request->input('medical_history'),
            is_regular: $request->boolean('is_regular'),
        );
    }

    public static function fromModel(Patient $patient): self
    {
        return new self(
            first_name: $patient->first_name,
            middle_name: $patient->middle_name,
            last_name: $patient->last_name,
            date_of_birth: $patient->date_of_birth?->toDateString(),
            gender: $patient->gender,
            civil_status: $patient->civil_status,
            occupation: $patient->occupation,
            nationality: $patient->nationality,
            blood_type: $patient->blood_type,
            phone: $patient->phone,
            email: $patient->email,
            address: $patient->address,
            street_address: $patient->street_address,
            city: $patient->city,
            province: $patient->province,
            emergency_contact_name: $patient->emergency_contact_name,
            emergency_contact_relationship: $patient->emergency_contact_relationship,
            emergency_contact_phone: $patient->emergency_contact_phone,
            allergies: $patient->allergies,
            medical_history: $patient->medical_history,
            is_regular: $patient->is_regular,
        );
    }

    public function toArray(): array
    {
        return array_filter(get_object_vars($this), fn ($value) => $value !== null);
    }
}
