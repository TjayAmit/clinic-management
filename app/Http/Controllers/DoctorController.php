<?php

namespace App\Http\Controllers;

use App\Http\Requests\DoctorRequest;
use App\Models\Doctor;
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
        $filters = $request->only(['search']);
        $doctors = $this->service->paginate($request);

        return Inertia::render('doctors/index', [
            'data' => $doctors,
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

        $users = $this->service->repository->usersAvailableForDoctor($doctor->user_id);

        return Inertia::render('doctors/edit', [
            'doctor' => $doctor,
            'users' => $users,
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

    public function availability()
    {
        $availability = $this->service->getTodayAvailability();

        return response()->json([
            'data' => $availability,
        ]);
    }
}
