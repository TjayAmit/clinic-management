<?php

namespace App\Http\Controllers;

use App\Http\Requests\AppointmentRequest;
use App\Http\Requests\FollowUpAppointmentRequest;
use App\Models\Appointment;
use App\Services\AppointmentService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AppointmentController extends Controller
{
    public function __construct(
        protected AppointmentService $service,
    ) {}

    public function index(Request $request)
    {
        $filters = $request->only(['search', 'date', 'doctor_id', 'status', 'walk_in']);
        $indexData = $this->service->getIndexData(auth()->user(), $filters, $request->integer('per_page', 10));

        return Inertia::render('appointments/index', [
            'data' => $indexData['data'],
            'filters' => $request->only(['search', 'date', 'doctor_id', 'status', 'walk_in', 'per_page']),
            'doctors' => $indexData['doctors'],
        ]);
    }

    public function create(Request $request)
    {
        $dependencies = $this->service->repository->getFormDependencies();

        return Inertia::render('appointments/create', [
            'patients' => $dependencies['patients'],
            'doctors' => $dependencies['doctors'],
            'services' => $dependencies['services'],
            'defaultPatientId' => $request->integer('patient_id') ?: null,
            'isWalkIn' => $request->boolean('walk_in'),
        ]);
    }

    public function store(AppointmentRequest $request)
    {
        $conflict = $this->service->checkConflict(
            $request->integer('doctor_id'),
            $request->input('appointment_date'),
            $request->input('start_time'),
            $request->input('end_time'),
        );

        if ($conflict) {
            return back()->withErrors(['start_time' => 'The doctor already has an appointment at this time.']);
        }

        $this->service->createFromRequest($request);

        return redirect()->route('appointments.index')->with('success', 'Appointment booked successfully.');
    }

    public function show(Appointment $appointment)
    {
        $data = $this->service->getShowData($appointment->id);

        return Inertia::render('appointments/show', [
            'appointment' => $data,
        ]);
    }

    public function edit(Appointment $appointment)
    {
        $dependencies = $this->service->repository->getFormDependencies();

        return Inertia::render('appointments/edit', [
            'appointment' => $appointment->load(['patient', 'doctor', 'service']),
            'patients' => $dependencies['patients'],
            'doctors' => $dependencies['doctors'],
            'services' => $dependencies['services'],
        ]);
    }

    public function update(AppointmentRequest $request, Appointment $appointment)
    {
        $conflict = $this->service->checkConflict(
            $request->integer('doctor_id'),
            $request->input('appointment_date'),
            $request->input('start_time'),
            $request->input('end_time'),
            $appointment->id,
        );

        if ($conflict) {
            return back()->withErrors(['start_time' => 'The doctor already has an appointment at this time.']);
        }

        $this->service->updateFromRequest($appointment->id, $request);

        return redirect()->route('appointments.show', $appointment)->with('success', 'Appointment updated successfully.');
    }

    public function destroy(Appointment $appointment)
    {
        $this->service->delete($appointment->id);

        return redirect()->route('appointments.index')->with('success', 'Appointment deleted successfully.');
    }

    public function confirm(Appointment $appointment)
    {
        $this->service->confirm($appointment->id);

        return redirect()->back()->with('success', 'Appointment confirmed.');
    }

    public function markInQueue(Appointment $appointment)
    {
        $this->service->markInQueue($appointment->id);

        return redirect()->back()->with('success', 'Appointment moved to queue.');
    }

    public function markInProgress(Appointment $appointment)
    {
        $this->service->markInProgress($appointment->id);

        return redirect()->back()->with('success', 'Appointment marked as in progress.');
    }

    public function needsFollowUp(Appointment $appointment)
    {
        $this->service->needsFollowUp($appointment->id);

        return redirect()->back()->with('success', 'Appointment marked as needs follow-up.');
    }

    public function cancel(Appointment $appointment)
    {
        $this->service->cancel($appointment->id);

        return redirect()->back()->with('success', 'Appointment cancelled.');
    }

    public function complete(Appointment $appointment)
    {
        $this->service->complete($appointment->id);

        return redirect()->back()->with('success', 'Appointment marked as completed.');
    }

    public function noShow(Appointment $appointment)
    {
        $this->service->noShow($appointment->id);

        return redirect()->back()->with('success', 'Appointment marked as no show.');
    }

    public function createFollowUp(FollowUpAppointmentRequest $request, Appointment $appointment)
    {
        $followUp = $this->service->createFollowUp($appointment, $request);

        return redirect()->route('appointments.show', $followUp)->with('success', 'Follow-up appointment created.');
    }
}
