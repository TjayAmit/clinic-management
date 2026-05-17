<?php

namespace App\Repositories;

use App\Models\Service;
use Illuminate\Pagination\LengthAwarePaginator;

interface ServiceRepository
{
    public function all(): iterable;

    public function findById(int $id): ?Service;

    public function paginate(array $filters, int $perPage): LengthAwarePaginator;

    public function getActive(): iterable;

    public function create(array $data): Service;

    public function update(int $id, array $data): Service;

    public function delete(int $id): bool;
}
