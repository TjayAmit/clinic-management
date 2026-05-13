<?php

namespace App\Repositories;

use App\Models\Patient;

interface PatientRepository
{
    public function all(): iterable;

    public function findById(int $id): ?Patient;

    public function search(string $term): iterable;

    public function findWithHistory(int $id): ?Patient;

    public function create(array $data): Patient;

    public function update(int $id, array $data): Patient;

    public function delete(int $id): bool;
}
