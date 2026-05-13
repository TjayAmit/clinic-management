<?php

namespace App\DTOs;

use App\Models\PatientVisit;
use Illuminate\Http\Request;

readonly class PatientVisitData
{
    public function __construct(
        public ?int $patient_id = null,
        public ?int $doctor_id = null,
        public ?int $appointment_id = null,
        public ?string $visited_at = null,
        public ?string $check_in_at = null,
        public ?string $check_out_at = null,
        public ?string $blood_pressure = null,
        public ?float $temperature = null,
        public ?float $weight = null,
        public ?int $heart_rate = null,
        public ?string $notes = null,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            patient_id: $request->input('patient_id'),
            doctor_id: $request->input('doctor_id'),
            appointment_id: $request->input('appointment_id'),
            visited_at: $request->input('visited_at'),
            check_in_at: $request->input('check_in_at'),
            check_out_at: $request->input('check_out_at'),
            blood_pressure: $request->input('blood_pressure'),
            temperature: $request->input('temperature'),
            weight: $request->input('weight'),
            heart_rate: $request->input('heart_rate'),
            notes: $request->input('notes'),
        );
    }

    public static function fromModel(PatientVisit $visit): self
    {
        return new self(
            patient_id: $visit->patient_id,
            doctor_id: $visit->doctor_id,
            appointment_id: $visit->appointment_id,
            visited_at: $visit->visited_at?->toDateTimeString(),
            check_in_at: $visit->check_in_at?->toDateTimeString(),
            check_out_at: $visit->check_out_at?->toDateTimeString(),
            blood_pressure: $visit->blood_pressure,
            temperature: $visit->temperature ? (float) $visit->temperature : null,
            weight: $visit->weight ? (float) $visit->weight : null,
            heart_rate: $visit->heart_rate,
            notes: $visit->notes,
        );
    }

    public function toArray(): array
    {
        return array_filter(get_object_vars($this), fn ($value) => $value !== null);
    }
}
