<?php

namespace App\Http\Controllers;

use App\Http\Requests\FeatureRequest;
use App\Models\Feature;
use App\Services\FeatureService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeatureController extends Controller
{
    public function __construct(
        protected FeatureService $service,
    ) {}

    public function index(Request $request)
    {
        $features = Feature::query()
            ->when($request->input('search'), function ($q, $search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('key', 'like', "%{$search}%");
            })
            ->when($request->boolean('enabled_only'), fn ($q) => $q->where('is_enabled', true))
            ->latest()
            ->paginate($request->integer('per_page', 10))
            ->withQueryString();

        return Inertia::render('features/index', [
            'data' => $features,
            'filters' => $request->only(['search', 'per_page', 'enabled_only']),
        ]);
    }

    public function create()
    {
        return Inertia::render('features/create');
    }

    public function store(FeatureRequest $request)
    {
        $this->service->createFromRequest($request);

        return redirect()->route('features.index')->with('success', 'Feature created successfully.');
    }

    public function show(Feature $feature)
    {
        return Inertia::render('features/show', [
            'feature' => $feature,
        ]);
    }

    public function edit(Feature $feature)
    {
        return Inertia::render('features/edit', [
            'feature' => $feature,
        ]);
    }

    public function update(FeatureRequest $request, Feature $feature)
    {
        $this->service->updateFromRequest($feature->id, $request);

        return redirect()->route('features.index')->with('success', 'Feature updated successfully.');
    }

    public function destroy(Feature $feature)
    {
        $this->service->delete($feature->id);

        return redirect()->route('features.index')->with('success', 'Feature deleted successfully.');
    }

    public function enable(Feature $feature)
    {
        $this->service->enable($feature->id);

        return back()->with('success', 'Feature enabled successfully.');
    }

    public function disable(Feature $feature)
    {
        $this->service->disable($feature->id);

        return back()->with('success', 'Feature disabled successfully.');
    }
}
