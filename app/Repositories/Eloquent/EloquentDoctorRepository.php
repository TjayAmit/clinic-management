<?php

namespace App\Repositories\Eloquent;

use App\Models\Doctor;
use App\Repositories\DoctorRepository;

class EloquentDoctorRepository implements DoctorRepository
{
    public function all(): iterable
    {
        return Doctor::with('user')->get();
    }

    public function findById(int $id): ?Doctor
    {
        return Doctor::find($id);
    }

    public function findByUserId(int $userId): ?Doctor
    {
        return Doctor::where('user_id', $userId)->first();
    }

    public function getActive(): iterable
    {
        return Doctor::with('user')->where('is_active', true)->get();
    }

    public function findWithSchedules(int $id): ?Doctor
    {
        return Doctor::with(['user', 'schedules'])->find($id);
    }

    public function create(array $data): Doctor
    {
        return Doctor::create($data);
    }

    public function update(int $id, array $data): Doctor
    {
        $doctor = $this->findById($id);
        $doctor->update($data);

        return $doctor;
    }

    public function delete(int $id): bool
    {
        $doctor = $this->findById($id);

        return $doctor->delete();
    }
}
