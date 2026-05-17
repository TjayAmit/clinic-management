<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DoctorCalendarController extends Controller
{
    public function __invoke(Request $request, Doctor $doctor): Response
    {
        $month = $request->input('month', now()->format('Y-m'));
        try {
            $date = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        } catch (\Exception) {
            $date = now()->startOfMonth();
        }

        $appointments = Appointment::with(['patient', 'service'])
            ->where('doctor_id', $doctor->id)
            ->whereYear('appointment_date', $date->year)
            ->whereMonth('appointment_date', $date->month)
            ->orderBy('appointment_date')
            ->orderBy('start_time')
            ->get()
            ->groupBy(fn ($a) => $a->appointment_date->format('Y-m-d'));

        $schedules = DoctorSchedule::where('doctor_id', $doctor->id)
            ->whereYear('scheduled_date', $date->year)
            ->whereMonth('scheduled_date', $date->month)
            ->where('is_available', true)
            ->orderBy('scheduled_date')
            ->orderBy('start_time')
            ->get()
            ->groupBy(fn ($s) => $s->scheduled_date->format('Y-m-d'));

        return Inertia::render('doctors/calendar', [
            'doctor' => $doctor->load('user'),
            'appointments' => $appointments,
            'schedules' => $schedules,
            'month' => $date->format('Y-m'),
            'monthLabel' => $date->format('F Y'),
            'year' => $date->year,
            'daysInMonth' => $date->daysInMonth,
            'startDay' => (int) $date->copy()->startOfMonth()->dayOfWeek,
        ]);
    }
}
