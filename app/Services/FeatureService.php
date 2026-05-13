<?php

namespace App\Services;

use App\DTOs\FeatureData;
use App\Models\Feature;
use App\Repositories\FeatureRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FeatureService
{
    public function __construct(
        protected FeatureRepository $repository,
    ) {}

    public function all(): iterable
    {
        return $this->repository->all();
    }

    public function findById(int $id): ?Feature
    {
        return $this->repository->findById($id);
    }

    public function findByKey(string $key): ?Feature
    {
        return $this->repository->findByKey($key);
    }

    public function getEnabled(): iterable
    {
        return $this->repository->getEnabled();
    }

    public function createFromRequest(Request $request): Feature
    {
        $model = null;
        $dto = null;

        DB::transaction(function () use ($request, &$model, &$dto) {
            $dto = FeatureData::fromRequest($request);
            $model = $this->repository->create($dto->toArray());
        });

        $this->logActivity('created', $model, $dto->toArray());

        return $model;
    }

    public function updateFromRequest(int $id, Request $request): Feature
    {
        $model = $this->repository->findById($id);
        $oldData = $model->getOriginal();
        $dto = null;
        $updatedModel = null;

        DB::transaction(function () use ($request, $model, &$dto, &$updatedModel) {
            $dto = FeatureData::fromRequest($request);
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

    public function enable(int $id): Feature
    {
        $model = $this->repository->findById($id);
        $result = null;

        DB::transaction(function () use ($id, &$result) {
            $result = $this->repository->enable($id, auth()->id());
        });

        $this->logActivity('enabled', $model, ['enabled_by' => auth()->id()]);

        return $result;
    }

    public function disable(int $id): Feature
    {
        $model = $this->repository->findById($id);
        $result = null;

        DB::transaction(function () use ($id, &$result) {
            $result = $this->repository->disable($id);
        });

        $this->logActivity('disabled', $model, ['disabled_by' => auth()->id()]);

        return $result;
    }

    private function logActivity(string $action, Model $model, array $data = []): void
    {
        $properties = match ($action) {
            'created' => ['new_data' => $data],
            'updated' => $data,
            'deleted' => ['deleted_data' => $data, 'deleted_by' => auth()->id()],
            'enabled' => $data,
            'disabled' => $data,
            default   => [],
        };

        activity()
            ->causedBy(auth()->user())
            ->performedOn($model)
            ->withProperties($properties)
            ->log("{$action} " . class_basename($model));
    }
}
