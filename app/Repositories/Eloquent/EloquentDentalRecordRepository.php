<?php

namespace App\Repositories\Eloquent;

use App\Models\DentalRecord;
use App\Repositories\DentalRecordRepository;

class EloquentDentalRecordRepository implements DentalRecordRepository
{
    public function all(): iterable
    {
        return DentalRecord::with(['patient', 'dentist.user', 'patientVisit'])->get();
    }

    public function findById(int $id): ?DentalRecord
    {
        return DentalRecord::find($id);
    }

    public function getByPatient(int $patientId): iterable
    {
        return DentalRecord::with(['dentist.user', 'patientVisit'])
            ->where('patient_id', $patientId)
            ->orderByDesc('created_at')
            ->get();
    }

    public function getByDentist(int $dentistId): iterable
    {
        return DentalRecord::with(['patient', 'patientVisit'])
            ->where('dentist_id', $dentistId)
            ->orderByDesc('created_at')
            ->get();
    }

    public function getByPatientVisit(int $patientVisitId): ?DentalRecord
    {
        return DentalRecord::where('patient_visit_id', $patientVisitId)->first();
    }

    public function create(array $data): DentalRecord
    {
        return DentalRecord::create($data);
    }

    public function update(int $id, array $data): DentalRecord
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
