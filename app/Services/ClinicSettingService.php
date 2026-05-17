<?php

namespace App\Services;

use App\Models\ClinicSetting;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClinicSettingService
{
    public function get(): ClinicSetting
    {
        return ClinicSetting::current();
    }

    public function updateFromRequest(Request $request): ClinicSetting
    {
        $model = ClinicSetting::current();
        $oldData = $model->getOriginal();
        $updatedModel = null;

        DB::transaction(function () use ($request, $model, &$updatedModel) {
            $model->update($request->validated());
            $updatedModel = $model->fresh();
        });

        $this->logActivity('updated', $updatedModel, [
            'old' => $oldData,
            'new' => $request->validated(),
        ]);

        return $updatedModel;
    }

    private function logActivity(string $action, Model $model, array $data = []): void
    {
        $properties = match ($action) {
            'updated' => $data,
            default   => [],
        };

        activity()
            ->causedBy(auth()->user())
            ->performedOn($model)
            ->withProperties($properties)
            ->log("{$action} " . class_basename($model));
    }
}
