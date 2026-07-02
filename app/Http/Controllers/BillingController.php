<?php

namespace App\Http\Controllers;

use App\Services\BillingService;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function __construct(
        protected BillingService $service,
    ) {}

    public function index(): Response
    {
        return Inertia::render('billing/index', $this->service->getIndexData());
    }
}
