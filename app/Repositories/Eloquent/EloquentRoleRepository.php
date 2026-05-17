<?php

namespace App\Repositories\Eloquent;

use App\Repositories\RoleRepository;
use Illuminate\Pagination\LengthAwarePaginator;
use Spatie\Permission\Models\Role;

class EloquentRoleRepository implements RoleRepository
{
    public function all(): iterable
    {
        return Role::withCount('permissions')->get();
    }

    public function findById(int $id): Role
    {
        return Role::withCount('permissions')->findOrFail($id);
    }

    public function paginate(array $filters, int $perPage): LengthAwarePaginator
    {
        $query = Role::withCount('permissions');

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where('name', 'like', "%{$search}%");
        }

        return $query->latest()->paginate($perPage)->withQueryString();
    }

    public function create(array $data): Role
    {
        return Role::create($data);
    }

    public function update(int $id, array $data): Role
    {
        $role = $this->findById($id);
        $role->update($data);

        return $role;
    }

    public function delete(int $id): bool
    {
        $role = $this->findById($id);

        return $role->delete();
    }
}
