<?php

namespace App\Http\Controllers;

use App\Http\Requests\DoctorScheduleRequest;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Services\DoctorScheduleService;
use Inertia\Inertia;

class DoctorScheduleController extends Controller
{
    public function __construct(
        protected DoctorScheduleService $service,
    ) {}

    public function index(Doctor $doctor)
    {
        $schedules = $this->service->getByDoctor($doctor->id);

        return Inertia::render('doctorSchedules/index', [
            'doctor'    => $doctor->load('user'),
            'schedules' => $schedules,
        ]);
    }

    public function store(DoctorScheduleRequest $request)
    {
        $this->service->upsertFromRequest($request);

        return redirect()->back()->with('success', 'Schedule saved successfully.');
    }

    public function update(DoctorScheduleRequest $request, DoctorSchedule $doctorSchedule)
    {
        $this->service->updateFromRequest($doctorSchedule->id, $request);

        return redirect()->back()->with('success', 'Schedule updated successfully.');
    }

    public function destroy(DoctorSchedule $doctorSchedule)
    {
        $this->service->delete($doctorSchedule->id);

        return redirect()->back()->with('success', 'Schedule removed successfully.');
    }
}
