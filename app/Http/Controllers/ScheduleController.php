<?php

namespace App\Http\Controllers;

use App\Services\AppointmentService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    public function __construct(
        protected AppointmentService $service,
    ) {}

    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $today = Carbon::today();

        $appointments = $this->service->getTodayAppointments($user, $today);

        return Inertia::render('schedule/index', [
            'appointments' => $appointments,
            'date' => $today->toDateString(),
            'dateLabel' => $today->format('l, F j, Y'),
        ]);
    }
}
