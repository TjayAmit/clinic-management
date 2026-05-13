<?php

namespace App\Http\Controllers;

use App\Http\Requests\MedicalRecordRequest;
use App\Models\Doctor;
use App\Models\MedicalRecord;
use App\Models\Patient;
use App\Models\PatientVisit;
use App\Services\MedicalRecordService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MedicalRecordController extends Controller
{
    public function __construct(
        protected MedicalRecordService $service,
    ) {}

    public function index(Request $request)
    {
        $records = MedicalRecord::with(['patient', 'doctor.user', 'patientVisit'])
            ->when($request->input('patient_id'), fn ($q, $id) => $q->where('patient_id', $id))
            ->when($request->input('doctor_id'), fn ($q, $id) => $q->where('doctor_id', $id))
            ->when($request->input('search'), function ($q, $search) {
                $q->whereHas('patient', fn ($p) =>
                    $p->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                );
            })
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 10))
            ->withQueryString();

        return Inertia::render('medicalRecords/index', [
            'data'    => $records,
            'filters' => $request->only(['search', 'patient_id', 'doctor_id', 'per_page']),
        ]);
    }

    public function create(Request $request)
    {
        return Inertia::render('medicalRecords/create', [
            'patients'      => Patient::orderBy('last_name')->get(['id', 'first_name', 'last_name']),
            'doctors'       => Doctor::with('user')->where('is_active', true)->get(),
            'patient_visit' => $request->input('visit_id')
                ? PatientVisit::with('patient', 'doctor')->find($request->input('visit_id'))
                : null,
        ]);
    }

    public function store(MedicalRecordRequest $request)
    {
        $record = $this->service->createFromRequest($request);

        return redirect()->route('medicalRecords.show', $record)->with('success', 'Medical record created successfully.');
    }

    public function show(MedicalRecord $medicalRecord)
    {
        $medicalRecord->load(['patient', 'doctor.user', 'patientVisit.appointment.service']);

        return Inertia::render('medicalRecords/show', [
            'record' => $medicalRecord,
        ]);
    }

    public function edit(MedicalRecord $medicalRecord)
    {
        return Inertia::render('medicalRecords/edit', [
            'record' => $medicalRecord->load(['patient', 'doctor', 'patientVisit']),
        ]);
    }

    public function update(MedicalRecordRequest $request, MedicalRecord $medicalRecord)
    {
        $this->service->updateFromRequest($medicalRecord->id, $request);

        return redirect()->route('medicalRecords.show', $medicalRecord)->with('success', 'Medical record updated successfully.');
    }

    public function destroy(MedicalRecord $medicalRecord)
    {
        $this->service->delete($medicalRecord->id);

        return redirect()->route('medicalRecords.index')->with('success', 'Medical record deleted successfully.');
    }
}
