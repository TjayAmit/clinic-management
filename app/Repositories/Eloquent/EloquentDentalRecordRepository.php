<?php

namespace App\Repositories\Eloquent;

use App\Models\DentalRecord;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\PatientVisit;
use App\Repositories\DentalRecordRepository;
use Illuminate\Pagination\LengthAwarePaginator;

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

    public function paginate(array $filters, int $perPage): LengthAwarePaginator
    {
        $query = DentalRecord::with(['patient', 'dentist.user', 'patientVisit']);

        if (! empty($filters['patient_id'])) {
            $query->where('patient_id', $filters['patient_id']);
        }

        if (! empty($filters['dentist_id'])) {
            $query->where('dentist_id', $filters['dentist_id']);
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('patient', fn ($p) => $p->where('first_name', 'like', "%{$search}%")
                ->orWhere('last_name', 'like', "%{$search}%")
            );
        }

        return $query->orderByDesc('created_at')->paginate($perPage)->withQueryString();
    }

    public function forCreate(?int $visitId): array
    {
        return [
            'patients' => Patient::orderBy('last_name')->get(['id', 'first_name', 'last_name']),
            'doctors' => Doctor::with('user')->where('is_active', true)->get(),
            'patient_visit' => $visitId
                ? PatientVisit::with('patient', 'dentist')->find($visitId)
                : null,
        ];
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
