<?php

namespace App\Http\Controllers;

use App\Services\DoctorScheduleService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DoctorScheduleHubController extends Controller
{
    public function __construct(
        protected DoctorScheduleService $service,
    ) {}

    public function __invoke(Request $request): Response
    {
        $schedules = $this->service->paginate($request);

        return Inertia::render('doctorsSchedules/index', [
            'data'    => $schedules,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }
}
