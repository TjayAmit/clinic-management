<?php

namespace App\Repositories;

use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Spatie\Permission\Models\Role;

interface RoleRepository
{
    public function all(): iterable;

    public function findById(int $id): Role;

    public function paginate(array $filters, int $perPage): LengthAwarePaginator;

    public function create(array $data): Role;

    public function update(int $id, array $data): Role;

    public function delete(int $id): bool;
}
