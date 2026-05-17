<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $service,
    ) {}

    public function __invoke(Request $request)
    {
        $data = $this->service->getData($request->user());

        return Inertia::render('dashboard', $data);
    }
}
