<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class DailyBoardController extends Controller
{
    public function __invoke(Request $request)
    {
        $date = $request->input('date', Carbon::today()->toDateString());
        $doctorId = $request->integer('doctor_id') ?: null;

        $appointments = Appointment::with(['patient', 'doctor.user', 'service'])
            ->whereDate('appointment_date', $date)
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->when($doctorId, fn ($q) => $q->where('doctor_id', $doctorId))
            ->orderBy('start_time')
            ->get();

        $entries = $appointments->map(fn (Appointment $appointment) => [
            'id'           => $appointment->id,
            'patient_name' => $appointment->patient->full_name,
            'doctor_name'  => $appointment->doctor->user->name,
            'service_name' => $appointment->service->name,
            'time'         => $appointment->start_time,
            'status'       => $appointment->status->value,
            'is_walk_in'   => $appointment->is_walk_in,
            'type'         => 'appointment',
        ])->values()->all();

        $doctors = Doctor::with('user')
            ->where('is_active', true)
            ->get()
            ->map(fn ($d) => [
                'id'   => $d->id,
                'name' => $d->user->name,
            ])
            ->values()
            ->all();

        return Inertia::render('DailyBoard/Index', [
            'entries' => $entries,
            'doctors' => $doctors,
            'filters' => [
                'date'      => $date,
                'doctor_id' => $doctorId,
            ],
        ]);
    }
}
