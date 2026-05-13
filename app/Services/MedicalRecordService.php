<?php

namespace App\Services;

use App\DTOs\MedicalRecordData;
use App\Models\MedicalRecord;
use App\Repositories\MedicalRecordRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MedicalRecordService
{
    public function __construct(
        protected MedicalRecordRepository $repository,
    ) {}

    public function all(): iterable
    {
        return $this->repository->all();
    }

    public function findById(int $id): ?MedicalRecord
    {
        return $this->repository->findById($id);
    }

    public function getByPatient(int $patientId): iterable
    {
        return $this->repository->getByPatient($patientId);
    }

    public function getByDoctor(int $doctorId): iterable
    {
        return $this->repository->getByDoctor($doctorId);
    }

    public function getByPatientVisit(int $patientVisitId): ?MedicalRecord
    {
        return $this->repository->getByPatientVisit($patientVisitId);
    }

    public function createFromRequest(Request $request): MedicalRecord
    {
        $model = null;
        $dto = null;

        DB::transaction(function () use ($request, &$model, &$dto) {
            $dto = MedicalRecordData::fromRequest($request);
            $model = $this->repository->create($dto->toArray());
        });

        $this->logActivity('created', $model, $dto->toArray());

        return $model;
    }

    public function updateFromRequest(int $id, Request $request): MedicalRecord
    {
        $model = $this->repository->findById($id);
        $oldData = $model->getOriginal();
        $dto = null;
        $updatedModel = null;

        DB::transaction(function () use ($request, $model, &$dto, &$updatedModel) {
            $dto = MedicalRecordData::fromRequest($request);
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
            default   => [],
        };

        activity()
            ->causedBy(auth()->user())
            ->performedOn($model)
            ->withProperties($properties)
            ->log("{$action} " . class_basename($model));
    }
}
