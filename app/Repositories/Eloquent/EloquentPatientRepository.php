<?php

namespace App\Repositories\Eloquent;

use App\Models\Patient;
use App\Repositories\PatientRepository;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentPatientRepository implements PatientRepository
{
    public function all(): iterable
    {
        return Patient::all();
    }

    public function findById(int $id): ?Patient
    {
        return Patient::find($id);
    }

    public function paginate(array $filters, int $perPage): LengthAwarePaginator
    {
        $query = Patient::query();

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['is_regular'])) {
            $query->where('is_regular', true);
        }

        return $query->latest()->paginate($perPage)->withQueryString();
    }

    public function toggleRegular(int $id): Patient
    {
        $patient = $this->findById($id);
        $patient->update(['is_regular' => ! $patient->is_regular]);

        return $patient;
    }

    public function search(string $term): iterable
    {
        return Patient::where(function ($query) use ($term) {
            $query->where('first_name', 'like', "%{$term}%")
                ->orWhere('last_name', 'like', "%{$term}%")
                ->orWhere('phone', 'like', "%{$term}%")
                ->orWhere('email', 'like', "%{$term}%");
        })->get();
    }

    public function findWithHistory(int $id): ?Patient
    {
        return Patient::with([
            'visits.dentalRecord',
            'visits.doctor.user',
            'appointments.service',
            'appointments.doctor.user',
        ])->find($id);
    }

    public function create(array $data): Patient
    {
        return Patient::create($data);
    }

    public function update(int $id, array $data): Patient
    {
        $patient = $this->findById($id);
        $patient->update($data);

        return $patient;
    }

    public function delete(int $id): bool
    {
        $patient = $this->findById($id);

        return $patient->delete();
    }
}
