<?php

namespace App\Http\Controllers;

use App\Services\AppointmentService;
use App\Services\DoctorService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class DailyBoardController extends Controller
{
    public function __construct(
        protected AppointmentService $appointmentService,
        protected DoctorService $doctorService,
    ) {}

    public function __invoke(Request $request)
    {
        $date = $request->input('date', Carbon::today()->toDateString());
        $doctorId = $request->integer('doctor_id') ?: null;

        $appointments = $this->appointmentService->getDailyBoardAppointments(
            auth()->user(),
            $date,
            $doctorId
        );

        $entries = $appointments->map(fn ($appointment) => [
            'id' => $appointment['id'],
            'patient_name' => $appointment['patient_name'],
            'doctor_name' => $appointment['doctor_name'],
            'service_name' => $appointment['service_name'],
            'time' => $appointment['time'],
            'status' => $appointment['status'],
            'is_walk_in' => $appointment['is_walk_in'],
            'type' => 'appointment',
            'series_position' => $appointment['series_position'],
            'series_total' => $appointment['series_total'],
        ])->values()->all();

        $doctors = $this->doctorService->getActive();

        return Inertia::render('dailyboard/Index', [
            'entries' => $entries,
            'doctors' => $doctors->map(fn ($d) => ['id' => $d->id, 'name' => $d->user->name])->values()->all(),
            'filters' => [
                'date' => $date,
                'doctor_id' => $doctorId,
            ],
        ]);
    }
}
