<?php

namespace App\Repositories\Eloquent;

use App\Models\Appointment;
use App\Repositories\AppointmentRepository;

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

    public function getByDoctor(int $doctorId, ?string $date = null): iterable
    {
        $query = Appointment::with(['patient', 'service'])
            ->where('dentist_id', $doctorId);

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

    public function updateStatus(int $id, string $status): Appointment
    {
        $appointment = $this->findById($id);
        $appointment->update(['status' => $status]);

        return $appointment;
    }

    public function checkConflict(int $doctorId, string $date, string $startTime, string $endTime, ?int $excludeId = null): bool
    {
        $query = Appointment::where('dentist_id', $doctorId)
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
