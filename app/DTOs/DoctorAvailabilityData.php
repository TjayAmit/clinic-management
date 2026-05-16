<?php

namespace App\DTOs;

readonly class DoctorAvailabilityData
{
    public function __construct(
        public int $doctor_id,
        public string $doctor_name,
        public ?string $specialization,
        public ?string $available_from,
        public ?string $available_until,
        public bool $is_available_today,
    ) {}
}
