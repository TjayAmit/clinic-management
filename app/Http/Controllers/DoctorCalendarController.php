<?php

namespace App\Http\Controllers;

use App\Services\AppointmentService;
use App\Services\DoctorScheduleService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DoctorCalendarController extends Controller
{
    public function __construct(
        protected AppointmentService $appointmentService,
        protected DoctorScheduleService $scheduleService,
    ) {}

    public function __invoke(Request $request, int $doctorId): Response
    {
        $month = $request->input('month', now()->format('Y-m'));
        try {
            $date = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        } catch (\Exception) {
            $date = now()->startOfMonth();
        }

        $appointments = $this->appointmentService->getByDoctorAndMonth($doctorId, $date->year, $date->month);
        $schedules = $this->scheduleService->getByDoctorAndMonth($doctorId, $date->year, $date->month);
        $doctor = $this->appointmentService->getDoctorById($doctorId);

        if (!$doctor) {
            abort(404, 'Doctor not found');
        }

        return Inertia::render('doctors/calendar', [
            'doctor' => $doctor,
            'appointments' => $appointments->groupBy(fn ($a) => $a->appointment_date->format('Y-m-d')),
            'schedules' => $schedules->groupBy(fn ($s) => $s->scheduled_date->format('Y-m-d')),
            'month' => $date->format('Y-m'),
            'monthLabel' => $date->format('F Y'),
            'year' => $date->year,
            'daysInMonth' => $date->daysInMonth,
            'startDay' => (int) $date->copy()->startOfMonth()->dayOfWeek,
        ]);
    }
}
