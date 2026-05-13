<?php

namespace App\Repositories\Eloquent;

use App\Models\DoctorSchedule;
use App\Repositories\DoctorScheduleRepository;

class EloquentDoctorScheduleRepository implements DoctorScheduleRepository
{
    public function all(): iterable
    {
        return DoctorSchedule::with('doctor.user')->get();
    }

    public function findById(int $id): ?DoctorSchedule
    {
        return DoctorSchedule::find($id);
    }

    public function getByDoctor(int $doctorId): iterable
    {
        return DoctorSchedule::where('doctor_id', $doctorId)
            ->orderBy('day_of_week')
            ->get();
    }

    public function getAvailableByDay(int $dayOfWeek): iterable
    {
        return DoctorSchedule::with('doctor.user')
            ->where('day_of_week', $dayOfWeek)
            ->where('is_available', true)
            ->get();
    }

    public function upsert(int $doctorId, int $dayOfWeek, array $data): DoctorSchedule
    {
        return DoctorSchedule::updateOrCreate(
            ['doctor_id' => $doctorId, 'day_of_week' => $dayOfWeek],
            $data
        );
    }

    public function create(array $data): DoctorSchedule
    {
        return DoctorSchedule::create($data);
    }

    public function update(int $id, array $data): DoctorSchedule
    {
        $schedule = $this->findById($id);
        $schedule->update($data);

        return $schedule;
    }

    public function delete(int $id): bool
    {
        $schedule = $this->findById($id);

        return $schedule->delete();
    }
}
