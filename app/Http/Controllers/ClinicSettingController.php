<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClinicSettingRequest;
use App\Services\ClinicSettingService;
use Inertia\Inertia;

class ClinicSettingController extends Controller
{
    public function __construct(
        protected ClinicSettingService $service,
    ) {}

    public function edit()
    {
        return Inertia::render('clinic-settings/edit', [
            'settings' => $this->service->get(),
        ]);
    }

    public function update(ClinicSettingRequest $request)
    {
        $this->service->updateFromRequest($request);

        return redirect()->route('clinic-settings.edit')->with('success', 'Clinic settings updated successfully.');
    }
}
