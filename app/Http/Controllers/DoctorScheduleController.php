<?php

namespace App\Http\Controllers;

use App\Http\Requests\DoctorScheduleRequest;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DoctorScheduleController extends Controller
{
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

        $rows = collect($request->validated('schedules'))
            ->map(fn (array $entry) => [
                'doctor_id'    => $doctor->id,
                'scheduled_date'  => $entry['scheduled_date'],
                'start_time'   => $entry['start_time'] ?? null,
                'end_time'     => $entry['end_time'] ?? null,
                'is_available' => $entry['is_available'],
                'created_at'   => now(),
                'updated_at'   => now(),
            ])
            ->all();

        DoctorSchedule::upsert(
            $rows,
            uniqueBy: ['doctor_id', 'scheduled_date'],
            update: ['start_time', 'end_time', 'is_available', 'updated_at'],
        );

        return redirect()->route('doctors.schedules.index', $doctor)
            ->with('success', 'Schedule updated successfully.');
    }

    public function store(DoctorScheduleRequest $request, Doctor $doctor): RedirectResponse
    {
        if (auth()->user()->hasRole('Doctor') && auth()->user()->doctor?->id !== $doctor->id) {
            abort(403);
        }

        $doctor->schedules()->create($request->validated());

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

        $schedule->delete();

        return redirect()->route('doctors.schedules.index', $doctor)
            ->with('success', 'Schedule deleted successfully.');
    }

    // Individual schedule CRUD methods
    public function create(): Response
    {
        $doctor = auth()->user()->doctor?->load('user');

        return Inertia::render('doctorsSchedules/create', [
            'doctor' => $doctor,
        ]);
    }

    public function storeIndividual(DoctorScheduleRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $doctorId = auth()->user()->doctor?->id;
        $dates = (array) ($validated['scheduled_date'] ?? []);

        foreach ($dates as $date) {
            DoctorSchedule::create([
                'doctor_id'    => $doctorId,
                'scheduled_date'  => $date,
                'start_time'   => $validated['start_time'] ?? null,
                'end_time'     => $validated['end_time'] ?? null,
                'is_available' => $validated['is_available'],
            ]);
        }

        $count = count($dates);

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
        $validated = $request->validated();
        $doctorId = $schedule->doctor_id;
        $dates = (array) ($validated['scheduled_date'] ?? []);

        // Delete the original schedule
        $schedule->delete();

        // Create new schedules for all selected dates
        foreach ($dates as $date) {
            DoctorSchedule::create([
                'doctor_id'    => $doctorId,
                'scheduled_date'  => $date,
                'start_time'   => $validated['start_time'] ?? null,
                'end_time'     => $validated['end_time'] ?? null,
                'is_available' => $validated['is_available'],
            ]);
        }

        $count = count($dates);

        return redirect()->route('doctor-schedules.index')
            ->with('success', $count > 1 ? "{$count} schedules updated successfully." : 'Schedule updated successfully.');
    }

    public function destroyIndividual(DoctorSchedule $schedule): RedirectResponse
    {
        $schedule->delete();

        return redirect()->route('doctor-schedules.index')
            ->with('success', 'Schedule deleted successfully.');
    }
}
