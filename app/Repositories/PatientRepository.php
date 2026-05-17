<?php

namespace App\Repositories;

use App\Models\Patient;
use Illuminate\Pagination\LengthAwarePaginator;

interface PatientRepository
{
    public function all(): iterable;

    public function findById(int $id): ?Patient;

    public function paginate(array $filters, int $perPage): LengthAwarePaginator;

    public function search(string $term): iterable;

    public function findWithHistory(int $id): ?Patient;

    public function toggleRegular(int $id): Patient;

    public function create(array $data): Patient;

    public function update(int $id, array $data): Patient;

    public function delete(int $id): bool;
}
