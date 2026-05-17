<?php

namespace App\Services;

use App\DTOs\ClinicSettingData;
use App\Models\ClinicSetting;
use App\Repositories\ClinicSettingRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClinicSettingService
{
    public function __construct(
        protected ClinicSettingRepository $repository,
    ) {}

    public function get(): ClinicSetting
    {
        return $this->repository->current();
    }

    public function updateFromRequest(Request $request): ClinicSetting
    {
        $model = $this->repository->current();
        $oldData = $model->getOriginal();
        $updatedModel = null;

        DB::transaction(function () use ($request, &$updatedModel) {
            $dto = ClinicSettingData::fromRequest($request);
            $updatedModel = $this->repository->update($dto->toArray());
        });

        $this->logActivity('updated', $updatedModel, [
            'old' => $oldData,
            'new' => $updatedModel->getAttributes(),
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
            ->log("{$action} ".class_basename($model));
    }
}
