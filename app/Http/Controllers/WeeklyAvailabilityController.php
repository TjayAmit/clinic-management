<?php

namespace App\Http\Controllers;

use App\Services\AvailabilityService;
use Illuminate\Http\JsonResponse;

class WeeklyAvailabilityController extends Controller
{
    public function __invoke(AvailabilityService $availability): JsonResponse
    {
        return response()->json($availability->weekAhead());
    }
}
