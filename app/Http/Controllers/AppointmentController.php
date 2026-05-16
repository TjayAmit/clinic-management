<?php

namespace App\Http\Controllers;

use App\Http\Requests\AppointmentRequest;
use App\Http\Requests\FollowUpAppointmentRequest;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Service;
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
        $appointments = Appointment::with(['patient', 'doctor.user', 'service'])
            ->forUser(auth()->user())
            ->when($request->input('date'), fn ($q, $date) => $q->whereDate('appointment_date', $date))
            ->when($request->input('doctor_id'), fn ($q, $id) => $q->where('doctor_id', $id))
            ->when($request->input('status'), fn ($q, $status) => $q->where('status', $status))
            ->when($request->boolean('walk_in'), fn ($q) => $q->where('is_walk_in', true))
            ->when($request->input('search'), function ($q, $search) {
                $q->where(function ($inner) use ($search) {
                    $inner->whereHas('patient', fn ($p) => $p->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                    )->orWhere('walk_in_name', 'like', "%{$search}%");
                });
            })
            ->orderBy('appointment_date')
            ->orderBy('start_time')
            ->paginate($request->integer('per_page', 10))
            ->withQueryString();

        return Inertia::render('appointments/index', [
            'data' => $appointments,
            'filters' => $request->only(['search', 'date', 'doctor_id', 'status', 'walk_in', 'per_page']),
            'doctors' => Doctor::with('user')->where('is_active', true)->get(['id', 'user_id', 'specialization']),
        ]);
    }

    public function create(Request $request)
    {
        return Inertia::render('appointments/create', [
            'patients' => Patient::orderBy('last_name')->limit(500)->get(['id', 'first_name', 'last_name', 'phone', 'email', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'blood_type', 'allergies', 'date_of_birth']),
            'doctors' => Doctor::with('user')->where('is_active', true)->get(),
            'services' => Service::where('is_active', true)->get(['id', 'name', 'category', 'duration_minutes', 'price']),
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
        $appointment->load(['patient', 'doctor.user', 'service', 'visit.dentalRecord', 'parent', 'followUps.patient', 'queue']);

        return Inertia::render('appointments/show', [
            'appointment' => $appointment,
        ]);
    }

    public function edit(Appointment $appointment)
    {
        return Inertia::render('appointments/edit', [
            'appointment' => $appointment->load(['patient', 'doctor', 'service']),
            'patients' => Patient::orderBy('last_name')->limit(500)->get(['id', 'first_name', 'last_name', 'phone', 'email', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'blood_type', 'allergies', 'date_of_birth']),
            'doctors' => Doctor::with('user')->where('is_active', true)->get(),
            'services' => Service::where('is_active', true)->get(['id', 'name', 'category', 'duration_minutes', 'price']),
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
