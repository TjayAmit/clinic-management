<?php

namespace App\Http\Controllers;

use App\Http\Requests\DoctorScheduleRequest;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Services\DoctorScheduleService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DoctorScheduleController extends Controller
{
    public function __construct(
        protected DoctorScheduleService $service,
    ) {}

    public function index(Doctor $doctor): Response
    {
        if (auth()->user()->hasRole('Doctor') && auth()->user()->doctor?->id !== $doctor->id) {
            abort(403);
        }

        $doctor->load(['user', 'schedules']);

        return Inertia::render('doctors/schedules/index', [
            'doctor'    => $doctor,
            'schedules' => $doctor->schedules->sortBy('day_of_week')->values(),
        ]);
    }

    public function update(DoctorScheduleRequest $request, Doctor $doctor): RedirectResponse
    {
        if (auth()->user()->hasRole('Doctor') && auth()->user()->doctor?->id !== $doctor->id) {
            abort(403);
        }

        $this->service->updateSchedules($doctor, $request->validated('schedules'));

        return redirect()->route('doctors.schedules.index', $doctor)
            ->with('success', 'Schedule updated successfully.');
    }

    public function store(DoctorScheduleRequest $request, Doctor $doctor): RedirectResponse
    {
        if (auth()->user()->hasRole('Doctor') && auth()->user()->doctor?->id !== $doctor->id) {
            abort(403);
        }

        $this->service->createForDoctor($doctor, $request->validated());

        return redirect()->route('doctors.schedules.index', $doctor)
            ->with('success', 'Schedule created successfully.');
    }

    public function destroy(Doctor $doctor, DoctorSchedule $schedule): RedirectResponse
    {
        if (auth()->user()->hasRole('Doctor') && auth()->user()->doctor?->id !== $doctor->id) {
            abort(403);
        }

        if ($schedule->doctor_id !== $doctor->id) {
            abort(403);
        }

        $this->service->delete($schedule->id);

        return redirect()->route('doctors.schedules.index', $doctor)
            ->with('success', 'Schedule deleted successfully.');
    }

    // Individual schedule CRUD methods
    public function create(): Response
    {
        $doctor = $this->service->getAuthDoctor();

        return Inertia::render('doctorsSchedules/create', [
            'doctor' => $doctor,
        ]);
    }

    public function storeIndividual(DoctorScheduleRequest $request): RedirectResponse
    {
        $doctorId = auth()->user()->doctor?->id;
        $count = $this->service->createIndividual($doctorId, $request->validated());

        return redirect()->route('doctor-schedules.index')
            ->with('success', $count > 1 ? "{$count} schedules created successfully." : 'Schedule created successfully.');
    }

    public function edit(DoctorSchedule $schedule): Response
    {
        $schedule->load(['doctor.user']);

        return Inertia::render('doctorsSchedules/edit', [
            'schedule' => $schedule,
        ]);
    }

    public function updateIndividual(DoctorScheduleRequest $request, DoctorSchedule $schedule): RedirectResponse
    {
        $count = $this->service->updateIndividual($schedule, $request->validated());

        return redirect()->route('doctor-schedules.index')
            ->with('success', $count > 1 ? "{$count} schedules updated successfully." : 'Schedule updated successfully.');
    }

    public function destroyIndividual(DoctorSchedule $schedule): RedirectResponse
    {
        $this->service->delete($schedule->id);

        return redirect()->route('doctor-schedules.index')
            ->with('success', 'Schedule deleted successfully.');
    }
}
