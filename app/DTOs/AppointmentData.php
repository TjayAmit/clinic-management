<?php

namespace App\DTOs;

use App\Models\Appointment;
use Illuminate\Http\Request;

readonly class AppointmentData
{
    public function __construct(
        public ?int $patient_id = null,
        public ?int $doctor_id = null,
        public ?int $service_id = null,
        public ?string $appointment_date = null,
        public ?string $start_time = null,
        public ?string $end_time = null,
        public string $status = 'pending',
        public ?string $notes = null,
        public ?int $created_by = null,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            patient_id: $request->input('patient_id'),
            doctor_id: $request->input('doctor_id'),
            service_id: $request->input('service_id'),
            appointment_date: $request->input('appointment_date'),
            start_time: $request->input('start_time'),
            end_time: $request->input('end_time'),
            status: $request->input('status', 'pending'),
            notes: $request->input('notes'),
            created_by: auth()->id(),
        );
    }

    public static function fromModel(Appointment $appointment): self
    {
        return new self(
            patient_id: $appointment->patient_id,
            doctor_id: $appointment->doctor_id,
            service_id: $appointment->service_id,
            appointment_date: $appointment->appointment_date?->toDateString(),
            start_time: $appointment->start_time,
            end_time: $appointment->end_time,
            status: $appointment->status,
            notes: $appointment->notes,
            created_by: $appointment->created_by,
        );
    }

    public function toArray(): array
    {
        return array_filter(get_object_vars($this), fn ($value) => $value !== null);
    }
}
