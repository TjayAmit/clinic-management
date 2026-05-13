<?php

namespace App\Repositories\Eloquent;

use App\Models\MedicalRecord;
use App\Repositories\MedicalRecordRepository;

class EloquentMedicalRecordRepository implements MedicalRecordRepository
{
    public function all(): iterable
    {
        return MedicalRecord::with(['patient', 'doctor.user', 'patientVisit'])->get();
    }

    public function findById(int $id): ?MedicalRecord
    {
        return MedicalRecord::find($id);
    }

    public function getByPatient(int $patientId): iterable
    {
        return MedicalRecord::with(['doctor.user', 'patientVisit'])
            ->where('patient_id', $patientId)
            ->orderByDesc('created_at')
            ->get();
    }

    public function getByDoctor(int $doctorId): iterable
    {
        return MedicalRecord::with(['patient', 'patientVisit'])
            ->where('doctor_id', $doctorId)
            ->orderByDesc('created_at')
            ->get();
    }

    public function getByPatientVisit(int $patientVisitId): ?MedicalRecord
    {
        return MedicalRecord::where('patient_visit_id', $patientVisitId)->first();
    }

    public function create(array $data): MedicalRecord
    {
        return MedicalRecord::create($data);
    }

    public function update(int $id, array $data): MedicalRecord
    {
        $record = $this->findById($id);
        $record->update($data);

        return $record;
    }

    public function delete(int $id): bool
    {
        $record = $this->findById($id);

        return $record->delete();
    }
}
