<?php

namespace App\Repositories\Eloquent;

use App\Models\Doctor;
use App\Models\User;
use App\Repositories\DoctorRepository;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

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

    public function paginate(array $filters, int $perPage): LengthAwarePaginator
    {
        $query = Doctor::with('user');

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%"))
                    ->orWhere('specialization', 'like', "%{$search}%")
                    ->orWhere('license_number', 'like', "%{$search}%");
            });
        }

        return $query->latest()->paginate($perPage)->withQueryString();
    }

    public function usersAvailableForDoctor(int $currentDoctorUserId): Collection
    {
        return User::whereDoesntHave('doctor')
            ->orWhere('id', $currentDoctorUserId)
            ->get(['id', 'name', 'email']);
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
