<?php

namespace App\Repositories\Eloquent;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\PatientVisit;
use App\Repositories\PatientVisitRepository;
use Illuminate\Pagination\LengthAwarePaginator;

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

    public function paginate(array $filters, int $perPage): LengthAwarePaginator
    {
        $query = PatientVisit::with(['patient', 'doctor.user', 'appointment']);

        if (! empty($filters['patient_id'])) {
            $query->where('patient_id', $filters['patient_id']);
        }

        if (! empty($filters['doctor_id'])) {
            $query->where('doctor_id', $filters['doctor_id']);
        }

        if (! empty($filters['date'])) {
            $query->whereDate('visited_at', $filters['date']);
        }

        return $query->orderByDesc('visited_at')->paginate($perPage)->withQueryString();
    }

    public function getFormDependencies(bool $excludeTerminal = false): array
    {
        $excludedStatuses = $excludeTerminal
            ? ['cancelled', 'no_show', 'completed']
            : ['cancelled', 'no_show'];

        return [
            'patients' => Patient::orderBy('last_name')->get(['id', 'first_name', 'last_name', 'phone']),
            'doctors' => Doctor::with('user')->where('is_active', true)->get(['id', 'user_id', 'specialization']),
            'appointments' => Appointment::with(['patient', 'doctor.user', 'service'])
                ->whereNotIn('status', $excludedStatuses)
                ->orderBy('appointment_date')
                ->orderBy('start_time')
                ->get(),
        ];
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

    public function firstOrCreate(array $attributes, array $values = []): PatientVisit
    {
        return PatientVisit::firstOrCreate($attributes, $values);
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
