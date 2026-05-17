<?php

namespace App\Http\Controllers;

use App\Services\AppointmentAvailabilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentAvailabilityController extends Controller
{
    public function __construct(
        protected AppointmentAvailabilityService $service,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        if ($request->filled('month')) {
            return response()->json($this->service->handleMonthly($request));
        }

        return response()->json($this->service->handleDaily($request));
    }
}
