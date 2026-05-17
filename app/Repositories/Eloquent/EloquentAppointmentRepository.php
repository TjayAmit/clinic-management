<?php

namespace App\Repositories\Eloquent;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Service;
use App\Models\User;
use App\Repositories\AppointmentRepository;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentAppointmentRepository implements AppointmentRepository
{
    public function all(): iterable
    {
        return Appointment::with(['patient', 'doctor.user', 'service'])->get();
    }

    public function findById(int $id): ?Appointment
    {
        return Appointment::find($id);
    }

    public function paginate(User $user, array $filters, int $perPage): LengthAwarePaginator
    {
        $query = Appointment::with(['patient', 'doctor.user', 'service'])
            ->forUser($user);

        if (! empty($filters['date'])) {
            $query->whereDate('appointment_date', $filters['date']);
        }

        if (! empty($filters['doctor_id'])) {
            $query->where('doctor_id', $filters['doctor_id']);
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['walk_in'])) {
            $query->where('is_walk_in', true);
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($inner) use ($search) {
                $inner->whereHas('patient', fn ($p) => $p->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                )->orWhere('walk_in_name', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('appointment_date')
            ->orderBy('start_time')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getFormDependencies(): array
    {
        return [
            'patients' => Patient::orderBy('last_name')->limit(500)->get([
                'id', 'first_name', 'last_name', 'phone', 'email', 'address',
                'emergency_contact_name', 'emergency_contact_phone', 'blood_type',
                'allergies', 'date_of_birth',
            ]),
            'doctors' => Doctor::with('user')->where('is_active', true)->get(),
            'services' => Service::where('is_active', true)->get(['id', 'name', 'category', 'duration_minutes', 'price']),
        ];
    }

    public function getActiveDoctors(): iterable
    {
        return Doctor::with('user')->where('is_active', true)->get(['id', 'user_id', 'specialization']);
    }

    public function getTodayAppointments(User $user, \Carbon\Carbon $date): \Illuminate\Database\Eloquent\Collection
    {
        $query = Appointment::with(['patient', 'doctor.user', 'service'])
            ->whereDate('appointment_date', $date)
            ->orderBy('start_time');

        if ($user->hasRole('Doctor') && $user->doctor) {
            $query->where('doctor_id', $user->doctor->id);
        }

        return $query->get();
    }

    public function getDailyBoardAppointments(User $user, string $date, ?int $doctorId = null): \Illuminate\Support\Collection
    {
        $query = Appointment::with(['patient', 'doctor.user', 'service'])
            ->forUser($user)
            ->whereDate('appointment_date', $date)
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->when($doctorId, fn ($q) => $q->where('doctor_id', $doctorId))
            ->orderBy('start_time');

        return $query->get()->map(fn (Appointment $appointment) => [
            'id' => $appointment->id,
            'patient_name' => $appointment->patient?->full_name ?? $appointment->walk_in_name ?? 'Walk-in',
            'doctor_name' => $appointment->doctor->user->name,
            'service_name' => $appointment->service->name,
            'time' => $appointment->start_time,
            'status' => $appointment->status->value,
            'is_walk_in' => $appointment->is_walk_in,
            'series_position' => $appointment->series_position,
            'series_total' => $appointment->series_total,
        ]);
    }

    public function getDoctorById(int $id): ?Doctor
    {
        return Doctor::with('user')->find($id);
    }

    public function getByDoctorAndMonth(int $doctorId, int $year, int $month): \Illuminate\Database\Eloquent\Collection
    {
        return Appointment::with(['patient', 'service'])
            ->where('doctor_id', $doctorId)
            ->whereYear('appointment_date', $year)
            ->whereMonth('appointment_date', $month)
            ->orderBy('appointment_date')
            ->orderBy('start_time')
            ->get();
    }

    public function getByDoctor(int $doctorId, ?string $date = null): iterable
    {
        $query = Appointment::with(['patient', 'service'])
            ->where('doctor_id', $doctorId);

        if ($date) {
            $query->whereDate('appointment_date', $date);
        }

        return $query->orderBy('appointment_date')->orderBy('start_time')->get();
    }

    public function getByPatient(int $patientId): iterable
    {
        return Appointment::with(['doctor.user', 'service'])
            ->where('patient_id', $patientId)
            ->orderByDesc('appointment_date')
            ->get();
    }

    public function getByDate(string $date): iterable
    {
        return Appointment::with(['patient', 'doctor.user', 'service'])
            ->whereDate('appointment_date', $date)
            ->orderBy('start_time')
            ->get();
    }

    public function getByStatus(string $status): iterable
    {
        return Appointment::with(['patient', 'doctor.user', 'service'])
            ->where('status', $status)
            ->orderBy('appointment_date')
            ->get();
    }

    public function getWalkInsByDate(string $date): iterable
    {
        return Appointment::with(['patient', 'doctor.user', 'service'])
            ->where('is_walk_in', true)
            ->whereDate('appointment_date', $date)
            ->orderBy('start_time')
            ->get();
    }

    public function updateStatus(int $id, string $status): Appointment
    {
        $appointment = $this->findById($id);
        $appointment->update(['status' => $status]);

        return $appointment;
    }

    public function checkConflict(int $doctorId, string $date, string $startTime, string $endTime, ?int $excludeId = null): bool
    {
        $query = Appointment::where('doctor_id', $doctorId)
            ->whereDate('appointment_date', $date)
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->where(function ($q) use ($startTime, $endTime) {
                $q->whereBetween('start_time', [$startTime, $endTime])
                    ->orWhereBetween('end_time', [$startTime, $endTime])
                    ->orWhere(function ($q2) use ($startTime, $endTime) {
                        $q2->where('start_time', '<=', $startTime)
                            ->where('end_time', '>=', $endTime);
                    });
            });

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

    public function create(array $data): Appointment
    {
        return Appointment::create($data);
    }

    public function update(int $id, array $data): Appointment
    {
        $appointment = $this->findById($id);
        $appointment->update($data);

        return $appointment;
    }

    public function delete(int $id): bool
    {
        $appointment = $this->findById($id);

        return $appointment->delete();
    }
}
