<?php

namespace App\Http\Controllers;

use App\Http\Requests\PatientRequest;
use App\Models\Patient;
use App\Services\PatientService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PatientController extends Controller
{
    public function __construct(
        protected PatientService $service,
    ) {}

    public function index(Request $request)
    {
        $patients = Patient::query()
            ->when($request->input('search'), function ($q, $search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->when($request->boolean('is_regular'), fn ($q) => $q->where('is_regular', true))
            ->latest()
            ->paginate($request->integer('per_page', 10))
            ->withQueryString();

        return Inertia::render('patients/index', [
            'data'    => $patients,
            'filters' => $request->only(['search', 'per_page', 'is_regular']),
        ]);
    }

    public function create()
    {
        return Inertia::render('patients/create');
    }

    public function store(PatientRequest $request)
    {
        $this->service->createFromRequest($request);

        return redirect()->route('patients.index')->with('success', 'Patient registered successfully.');
    }

    public function show(Patient $patient)
    {
        $patient = $this->service->findWithHistory($patient->id);

        return Inertia::render('patients/show', [
            'patient' => $patient,
        ]);
    }

    public function edit(Patient $patient)
    {
        return Inertia::render('patients/edit', [
            'patient' => $patient,
        ]);
    }

    public function update(PatientRequest $request, Patient $patient)
    {
        $this->service->updateFromRequest($patient->id, $request);

        return redirect()->route('patients.show', $patient)->with('success', 'Patient updated successfully.');
    }

    public function destroy(Patient $patient)
    {
        $this->service->delete($patient->id);

        return redirect()->route('patients.index')->with('success', 'Patient deleted successfully.');
    }

    public function toggleRegular(Patient $patient)
    {
        $patient->update(['is_regular' => !$patient->is_regular]);

        $message = $patient->is_regular ? 'Patient marked as regular.' : 'Regular status removed.';

        return back()->with('success', $message);
    }
}
