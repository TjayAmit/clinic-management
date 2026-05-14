<?php

namespace App\Repositories\Eloquent;

use App\Models\PatientVisit;
use App\Repositories\PatientVisitRepository;

class EloquentPatientVisitRepository implements PatientVisitRepository
{
    public function all(): iterable
    {
        return PatientVisit::with(['patient', 'doctor.user'])->get();
    }

    public function findById(int $id): ?PatientVisit
    {
        return PatientVisit::find($id);
    }

    public function getByPatient(int $patientId): iterable
    {
        return PatientVisit::with(['doctor.user', 'dentalRecord'])
            ->where('patient_id', $patientId)
            ->orderByDesc('visited_at')
            ->get();
    }

    public function getByDoctor(int $doctorId, ?string $date = null): iterable
    {
        $query = PatientVisit::with(['patient', 'dentalRecord'])
            ->where('doctor_id', $doctorId);

        if ($date) {
            $query->whereDate('visited_at', $date);
        }

        return $query->orderByDesc('visited_at')->get();
    }

    public function getByAppointment(int $appointmentId): ?PatientVisit
    {
        return PatientVisit::where('appointment_id', $appointmentId)->first();
    }

    public function getRecentByPatient(int $patientId, int $limit = 10): iterable
    {
        return PatientVisit::with(['doctor.user', 'dentalRecord'])
            ->where('patient_id', $patientId)
            ->orderByDesc('visited_at')
            ->limit($limit)
            ->get();
    }

    public function create(array $data): PatientVisit
    {
        return PatientVisit::create($data);
    }

    public function update(int $id, array $data): PatientVisit
    {
        $visit = $this->findById($id);
        $visit->update($data);

        return $visit;
    }

    public function delete(int $id): bool
    {
        $visit = $this->findById($id);

        return $visit->delete();
    }
}
