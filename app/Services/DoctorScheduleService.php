<?php

namespace App\Services;

use App\DTOs\DoctorScheduleData;
use App\Models\DoctorSchedule;
use App\Repositories\DoctorScheduleRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DoctorScheduleService
{
    public function __construct(
        protected DoctorScheduleRepository $repository,
    ) {}

    public function getByDoctor(int $doctorId): iterable
    {
        return $this->repository->getByDoctor($doctorId);
    }

    public function getAvailableByDay(int $dayOfWeek): iterable
    {
        return $this->repository->getAvailableByDay($dayOfWeek);
    }

    public function upsertFromRequest(Request $request): DoctorSchedule
    {
        $dto = DoctorScheduleData::fromRequest($request);
        $model = null;

        DB::transaction(function () use ($dto, &$model) {
            $model = $this->repository->upsert(
                $dto->doctor_id,
                $dto->day_of_week,
                $dto->toArray()
            );
        });

        $this->logActivity('upserted', $model, $dto->toArray());

        return $model;
    }

    public function updateFromRequest(int $id, Request $request): DoctorSchedule
    {
        $model = $this->repository->findById($id);
        $oldData = $model->getOriginal();
        $dto = null;
        $updatedModel = null;

        DB::transaction(function () use ($request, $model, &$dto, &$updatedModel) {
            $dto = DoctorScheduleData::fromRequest($request);
            $updatedModel = $this->repository->update($model->id, $dto->toArray());
        });

        $this->logActivity('updated', $updatedModel, ['old' => $oldData, 'new' => $dto->toArray()]);

        return $updatedModel;
    }

    public function delete(int $id): bool
    {
        $model = $this->repository->findById($id);
        $data = $model->toArray();
        $result = false;

        DB::transaction(function () use ($id, &$result) {
            $result = $this->repository->delete($id);
        });

        $this->logActivity('deleted', $model, $data);

        return $result;
    }

    private function logActivity(string $action, Model $model, array $data = []): void
    {
        $properties = match ($action) {
            'created', 'upserted' => ['new_data' => $data],
            'updated'             => $data,
            'deleted'             => ['deleted_data' => $data, 'deleted_by' => auth()->id()],
            default               => [],
        };

        activity()
            ->causedBy(auth()->user())
            ->performedOn($model)
            ->withProperties($properties)
            ->log("{$action} " . class_basename($model));
    }
}
