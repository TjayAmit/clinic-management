<?php
namespace App\Http\Controllers;
use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $today = Carbon::today();

        $query = Appointment::with(['patient', 'doctor.user', 'service'])
            ->whereDate('appointment_date', $today)
            ->orderBy('start_time');

        if ($user->hasRole('Doctor') && $user->doctor) {
            $query->where('doctor_id', $user->doctor->id);
        }

        return Inertia::render('schedule/index', [
            'appointments' => $query->get(),
            'date'         => $today->toDateString(),
            'dateLabel'    => $today->format('l, F j, Y'),
        ]);
    }
}
