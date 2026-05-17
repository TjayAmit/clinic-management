<?php

namespace App\Services;

use App\Repositories\RoleRepository;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleService
{
    public function __construct(
        protected RoleRepository $repository,
    ) {}

    public function paginate(array $filters, int $perPage): LengthAwarePaginator
    {
        return $this->repository->paginate($filters, $perPage);
    }

    public function allPermissions(): Collection
    {
        return Permission::select('id', 'name')->orderBy('name')->get();
    }

    public function findById(int $id): Role
    {
        return $this->repository->findById($id);
    }

    public function create(array $validated): Role
    {
        $role = $this->repository->create([
            'name' => $validated['name'],
            'guard_name' => 'web',
        ]);

        if (! empty($validated['permissions'])) {
            $permissionNames = Permission::whereIn('id', $validated['permissions'])->pluck('name');
            $role->syncPermissions($permissionNames);
        }

        return $role;
    }

    public function update(int $id, array $validated): Role
    {
        $role = $this->repository->update($id, ['name' => $validated['name']]);

        if (! empty($validated['permissions'])) {
            $permissionNames = Permission::whereIn('id', $validated['permissions'])->pluck('name');
            $role->syncPermissions($permissionNames);
        } else {
            $role->syncPermissions([]);
        }

        return $role;
    }

    public function delete(int $id): void
    {
        $role = $this->repository->findById($id);

        if ($role->name === 'super-admin') {
            abort(422, 'Cannot delete the super-admin role.');
        }

        $this->repository->delete($id);
    }
}
