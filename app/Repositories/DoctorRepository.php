<?php

namespace App\Repositories;

use App\Models\Doctor;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface DoctorRepository
{
    public function all(): iterable;

    public function findById(int $id): ?Doctor;

    public function findByUserId(int $userId): ?Doctor;

    public function paginate(array $filters, int $perPage): LengthAwarePaginator;

    public function usersAvailableForDoctor(int $currentDoctorUserId): Collection;

    public function getActive(): iterable;

    public function findWithSchedules(int $id): ?Doctor;

    public function create(array $data): Doctor;

    public function update(int $id, array $data): Doctor;

    public function delete(int $id): bool;
}
