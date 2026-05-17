<?php

namespace App\Http\Controllers;

use App\Services\RoleService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function __construct(
        protected RoleService $service,
    ) {}

    public function index(Request $request)
    {
        $filters = $request->only(['search']);
        $roles = $this->service->paginate($filters, $request->integer('per_page', 10));

        return Inertia::render('roles/index', [
            'data' => $roles,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('roles/create', [
            'permissions' => $this->service->allPermissions(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'array',
            'permissions.*' => 'integer|exists:permissions,id',
        ]);

        $this->service->create($validated);

        return redirect()->route('roles.index')->with('success', 'Role created successfully');
    }

    public function show(Role $role)
    {
        $role->load(['permissions']);

        return Inertia::render('roles/show', [
            'role' => $role,
        ]);
    }

    public function edit(Role $role)
    {
        $role->load(['permissions']);

        return Inertia::render('roles/edit', [
            'role' => $role,
            'permissions' => $this->service->allPermissions(),
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,'.$role->id,
            'permissions' => 'array',
            'permissions.*' => 'integer|exists:permissions,id',
        ]);

        $this->service->update($role->id, $validated);

        return redirect()->route('roles.index')->with('success', 'Role updated successfully');
    }

    public function destroy(Role $role)
    {
        if ($role->name === 'super-admin') {
            return redirect()->route('roles.index')->with('error', 'Cannot delete the super-admin role');
        }

        $this->service->delete($role->id);

        return redirect()->route('roles.index')->with('success', 'Role deleted successfully');
    }
}
