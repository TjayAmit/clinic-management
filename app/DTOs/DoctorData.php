<?php

namespace App\DTOs;

use App\Models\Doctor;
use Illuminate\Http\Request;

readonly class DoctorData
{
    public function __construct(
        public ?int $user_id = null,
        public ?string $specialization = null,
        public ?string $license_number = null,
        public ?string $phone = null,
        public ?string $bio = null,
        public bool $is_active = true,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            user_id: $request->input('user_id'),
            specialization: $request->input('specialization'),
            license_number: $request->input('license_number'),
            phone: $request->input('phone'),
            bio: $request->input('bio'),
            is_active: $request->boolean('is_active', true),
        );
    }

    public static function fromModel(Doctor $doctor): self
    {
        return new self(
            user_id: $doctor->user_id,
            specialization: $doctor->specialization,
            license_number: $doctor->license_number,
            phone: $doctor->phone,
            bio: $doctor->bio,
            is_active: $doctor->is_active,
        );
    }

    public function toArray(): array
    {
        return array_filter(get_object_vars($this), fn ($value) => $value !== null);
    }
}
