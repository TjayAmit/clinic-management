<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserRequest;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function __construct(
        protected UserService $service,
    ) {}

    public function index(Request $request)
    {
        $filters = $request->only(['search']);
        $users = $this->service->paginate($filters, 10);

        return Inertia::render('users/index', [
            'data' => $users,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('users/create', [
            'roles' => ['Admin', 'Doctor', 'Staff'],
        ]);
    }

    public function store(UserRequest $request)
    {
        $user = $this->service->createFromRequest($request);
        $user->syncRoles($request->validated('roles'));

        return redirect()->route('users.index')->with('success', 'User created successfully');
    }

    public function show(User $user)
    {
        $user->load('roles');

        return Inertia::render('users/show', [
            'user' => $user,
        ]);
    }

    public function edit(User $user)
    {
        $user->load('roles');

        return Inertia::render('users/edit', [
            'user' => $user,
            'roles' => ['Admin', 'Doctor', 'Staff'],
        ]);
    }

    public function update(UserRequest $request, User $user)
    {
        $this->service->updateFromRequest($user->id, $request);
        $user->syncRoles($request->validated('roles'));

        return redirect()->route('users.index')->with('success', 'User updated successfully');
    }

    public function destroy(User $user)
    {
        $this->service->delete($user->id);

        return redirect()->route('users.index')->with('success', 'User deleted successfully');
    }
}
