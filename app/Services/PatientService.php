<?php

namespace App\Services;

use App\DTOs\PatientData;
use App\Models\Patient;
use App\Repositories\PatientRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PatientService
{
    public function __construct(
        protected PatientRepository $repository,
    ) {}

    public function all(): iterable
    {
        return $this->repository->all();
    }

    public function findById(int $id): ?Patient
    {
        return $this->repository->findById($id);
    }

    public function paginate(Request $request): \Illuminate\Pagination\LengthAwarePaginator
    {
        $filters = $request->only(['search', 'per_page', 'is_regular']);

        return $this->repository->paginate($filters, $request->integer('per_page', 10));
    }

    public function toggleRegular(int $id): Patient
    {
        $patient = $this->repository->toggleRegular($id);
        $this->logActivity('updated', $patient, ['is_regular' => $patient->is_regular]);

        return $patient;
    }

    public function search(string $term): iterable
    {
        return $this->repository->search($term);
    }

    public function findWithHistory(int $id): ?Patient
    {
        return $this->repository->findWithHistory($id);
    }

    public function createFromRequest(Request $request): Patient
    {
        $model = null;
        $dto = null;

        DB::transaction(function () use ($request, &$model, &$dto) {
            $dto = PatientData::fromRequest($request);
            $model = $this->repository->create($dto->toArray());
        });

        $this->logActivity('created', $model, $dto->toArray());

        return $model;
    }

    public function updateFromRequest(int $id, Request $request): Patient
    {
        $model = $this->repository->findById($id);
        $oldData = $model->getOriginal();
        $dto = null;
        $updatedModel = null;

        DB::transaction(function () use ($request, $model, &$dto, &$updatedModel) {
            $dto = PatientData::fromRequest($request);
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
            'created' => ['new_data' => $data],
            'updated' => $data,
            'deleted' => ['deleted_data' => $data, 'deleted_by' => auth()->id()],
            default => [],
        };

        activity()
            ->causedBy(auth()->user())
            ->performedOn($model)
            ->withProperties($properties)
            ->log("{$action} ".class_basename($model));
    }
}
