<?php

namespace App\Http\Controllers;

use App\Http\Requests\DentalRecordRequest;
use App\Models\DentalRecord;
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
        $records = $this->service->paginate($request);

        return Inertia::render('dentalRecords/index', [
            'data' => $records,
            'filters' => $request->only(['search', 'patient_id', 'dentist_id', 'per_page']),
        ]);
    }

    public function create(Request $request)
    {
        $props = $this->service->getCreateProps($request);

        return Inertia::render('dentalRecords/create', $props);
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
