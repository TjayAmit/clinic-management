<?php

namespace App\Repositories\Eloquent;

use App\Models\Patient;
use App\Repositories\PatientRepository;

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
