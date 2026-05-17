<?php

namespace App\Http\Controllers;

use App\Models\DoctorSchedule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DoctorScheduleHubController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $schedules = DoctorSchedule::with(['doctor.user'])
            ->when($request->input('search'), function ($q, $search) {
                $q->whereHas('doctor.user', fn ($u) => $u->where('name', 'like', "%{$search}%"));
            })
            ->latest()
            ->paginate($request->integer('per_page', 10))
            ->withQueryString();

        return Inertia::render('doctorsSchedules/index', [
            'data'    => $schedules,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }
}
