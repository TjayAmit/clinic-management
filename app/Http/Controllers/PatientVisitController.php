<?php

namespace App\Http\Controllers;

use App\Http\Requests\PatientVisitRequest;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\PatientVisit;
use App\Services\PatientVisitService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PatientVisitController extends Controller
{
    public function __construct(
        protected PatientVisitService $service,
    ) {}

    public function index(Request $request)
    {
        $visits = PatientVisit::with(['patient', 'doctor.user', 'appointment'])
            ->when($request->input('patient_id'), fn ($q, $id) => $q->where('patient_id', $id))
            ->when($request->input('doctor_id'), fn ($q, $id) => $q->where('doctor_id', $id))
            ->when($request->input('date'), fn ($q, $date) => $q->whereDate('visited_at', $date))
            ->orderByDesc('visited_at')
            ->paginate($request->integer('per_page', 10))
            ->withQueryString();

        return Inertia::render('patientVisits/index', [
            'data'    => $visits,
            'filters' => $request->only(['patient_id', 'doctor_id', 'date', 'per_page']),
        ]);
    }

    public function store(PatientVisitRequest $request)
    {
        $visit = $this->service->createFromRequest($request);

        return redirect()->route('patientVisits.show', $visit)->with('success', 'Visit created successfully.');
    }

    public function show(PatientVisit $patientVisit)
    {
        $patientVisit->load(['patient', 'doctor.user', 'appointment.service', 'medicalRecord']);

        return Inertia::render('patientVisits/show', [
            'visit' => $patientVisit,
        ]);
    }

    public function update(PatientVisitRequest $request, PatientVisit $patientVisit)
    {
        $this->service->updateFromRequest($patientVisit->id, $request);

        return redirect()->back()->with('success', 'Visit updated successfully.');
    }

    public function destroy(PatientVisit $patientVisit)
    {
        $this->service->delete($patientVisit->id);

        return redirect()->route('patientVisits.index')->with('success', 'Visit deleted successfully.');
    }

    public function checkIn(PatientVisit $patientVisit)
    {
        $this->service->checkIn($patientVisit->id);

        return redirect()->back()->with('success', 'Patient checked in.');
    }

    public function checkOut(PatientVisit $patientVisit)
    {
        $this->service->checkOut($patientVisit->id);

        return redirect()->back()->with('success', 'Patient checked out.');
    }
}
