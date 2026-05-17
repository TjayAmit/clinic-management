<?php

namespace App\Http\Controllers;

use App\Http\Requests\ServiceRequest;
use App\Models\Service;
use App\Services\ServiceService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function __construct(
        protected ServiceService $service,
    ) {}

    public function index(Request $request)
    {
        $services = $this->service->paginate($request);

        return Inertia::render('services/index', [
            'data' => $services,
            'filters' => $request->only(['search', 'per_page', 'active_only']),
        ]);
    }

    public function create()
    {
        return Inertia::render('services/create');
    }

    public function store(ServiceRequest $request)
    {
        $this->service->createFromRequest($request);

        return redirect()->route('services.index')->with('success', 'Service created successfully.');
    }

    public function show(Service $service)
    {
        return Inertia::render('services/show', [
            'service' => $service,
        ]);
    }

    public function edit(Service $service)
    {
        return Inertia::render('services/edit', [
            'service' => $service,
        ]);
    }

    public function update(ServiceRequest $request, Service $service)
    {
        $this->service->updateFromRequest($service->id, $request);

        return redirect()->route('services.index')->with('success', 'Service updated successfully.');
    }

    public function destroy(Service $service)
    {
        $this->service->delete($service->id);

        return redirect()->route('services.index')->with('success', 'Service deleted successfully.');
    }
}
