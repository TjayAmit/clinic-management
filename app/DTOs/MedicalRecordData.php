<?php

namespace App\DTOs;

use App\Models\MedicalRecord;
use Illuminate\Http\Request;

readonly class MedicalRecordData
{
    public function __construct(
        public ?int $patient_visit_id = null,
        public ?int $patient_id = null,
        public ?int $doctor_id = null,
        public ?string $chief_complaint = null,
        public ?string $diagnosis = null,
        public ?string $prescription = null,
        public ?string $notes = null,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            patient_visit_id: $request->input('patient_visit_id'),
            patient_id: $request->input('patient_id'),
            doctor_id: $request->input('doctor_id'),
            chief_complaint: $request->input('chief_complaint'),
            diagnosis: $request->input('diagnosis'),
            prescription: $request->input('prescription'),
            notes: $request->input('notes'),
        );
    }

    public static function fromModel(MedicalRecord $record): self
    {
        return new self(
            patient_visit_id: $record->patient_visit_id,
            patient_id: $record->patient_id,
            doctor_id: $record->doctor_id,
            chief_complaint: $record->chief_complaint,
            diagnosis: $record->diagnosis,
            prescription: $record->prescription,
            notes: $record->notes,
        );
    }

    public function toArray(): array
    {
        return array_filter(get_object_vars($this), fn ($value) => $value !== null);
    }
}
