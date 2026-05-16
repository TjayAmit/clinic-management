<?php

namespace App\Http\Controllers;

use App\Http\Requests\DentalRecordRequest;
use App\Models\DentalRecord;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\PatientVisit;
use App\Services\DentalRecordService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DentalRecordController extends Controller
{
    public function __construct(
        protected DentalRecordService $service,
    ) {}

    public function index(Request $request)
    {
        $records = DentalRecord::with(['patient', 'dentist.user', 'patientVisit'])
            ->when($request->input('patient_id'), fn ($q, $id) => $q->where('patient_id', $id))
            ->when($request->input('dentist_id'), fn ($q, $id) => $q->where('dentist_id', $id))
            ->when($request->input('search'), function ($q, $search) {
                $q->whereHas('patient', fn ($p) => $p->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                );
            })
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 10))
            ->withQueryString();

        return Inertia::render('dentalRecords/index', [
            'data' => $records,
            'filters' => $request->only(['search', 'patient_id', 'dentist_id', 'per_page']),
        ]);
    }

    public function create(Request $request)
    {
        return Inertia::render('dentalRecords/create', [
            'patients' => Patient::orderBy('last_name')->get(['id', 'first_name', 'last_name']),
            'doctors' => Doctor::with('user')->where('is_active', true)->get(),
            'patient_visit' => $request->input('visit_id')
                ? PatientVisit::with('patient', 'dentist')->find($request->input('visit_id'))
                : null,
        ]);
    }

    public function store(DentalRecordRequest $request)
    {
        $record = $this->service->createFromRequest($request);

        return redirect()->route('dentalRecords.show', $record)->with('success', 'Dental record created successfully.');
    }

    public function show(DentalRecord $dentalRecord)
    {
        $dentalRecord->load(['patient', 'dentist.user', 'patientVisit.appointment.service']);

        return Inertia::render('dentalRecords/show', [
            'record' => $dentalRecord,
        ]);
    }

    public function edit(DentalRecord $dentalRecord)
    {
        return Inertia::render('dentalRecords/edit', [
            'record' => $dentalRecord->load(['patient', 'dentist', 'patientVisit']),
        ]);
    }

    public function update(DentalRecordRequest $request, DentalRecord $dentalRecord)
    {
        $this->service->updateFromRequest($dentalRecord->id, $request);

        return redirect()->route('dentalRecords.show', $dentalRecord)->with('success', 'Dental record updated successfully.');
    }

    public function destroy(DentalRecord $dentalRecord)
    {
        $this->service->delete($dentalRecord->id);

        return redirect()->route('dentalRecords.index')->with('success', 'Dental record deleted successfully.');
    }
}
