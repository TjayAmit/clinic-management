<?php

namespace App\Http\Controllers;

use App\Http\Requests\DoctorRequest;
use App\Models\Doctor;
use App\Models\User;
use App\Services\DoctorService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DoctorController extends Controller
{
    public function __construct(
        protected DoctorService $service,
    ) {}

    public function index(Request $request)
    {
        $doctors = Doctor::with('user')
            ->when($request->input('search'), function ($q, $search) {
                $q->whereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%"))
                    ->orWhere('specialization', 'like', "%{$search}%")
                    ->orWhere('license_number', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($request->integer('per_page', 10))
            ->withQueryString();

        return Inertia::render('doctors/index', [
            'data'    => $doctors,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('doctors/create');
    }

    public function store(DoctorRequest $request)
    {
        $this->service->createFromRequest($request);

        return redirect()->route('doctors.index')->with('success', 'Doctor created successfully.');
    }

    public function show(Doctor $doctor)
    {
        $doctor->load(['user', 'schedules']);

        return Inertia::render('doctors/show', [
            'doctor' => $doctor,
        ]);
    }

    public function edit(Doctor $doctor)
    {
        $doctor->load('user');

        $users = User::whereDoesntHave('doctor')
            ->orWhere('id', $doctor->user_id)
            ->get(['id', 'name', 'email']);

        return Inertia::render('doctors/edit', [
            'doctor' => $doctor,
            'users'  => $users,
        ]);
    }

    public function update(DoctorRequest $request, Doctor $doctor)
    {
        $this->service->updateFromRequest($doctor->id, $request);

        return redirect()->route('doctors.index')->with('success', 'Doctor updated successfully.');
    }

    public function destroy(Doctor $doctor)
    {
        $this->service->delete($doctor->id);

        return redirect()->route('doctors.index')->with('success', 'Doctor deleted successfully.');
    }
}
