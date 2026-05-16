<?php

namespace App\Services;

use App\DTOs\PatientVisitData;
use App\Models\Appointment;
use App\Models\PatientVisit;
use App\Repositories\PatientVisitRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;

class PatientVisitService
{
    public function __construct(
        protected PatientVisitRepository $repository,
    ) {}

    public function all(): iterable
    {
        return $this->repository->all();
    }

    public function findById(int $id): ?PatientVisit
    {
        return $this->repository->findById($id);
    }

    public function getByPatient(int $patientId): iterable
    {
        return $this->repository->getByPatient($patientId);
    }

    public function getByDoctor(int $doctorId, ?string $date = null): iterable
    {
        return $this->repository->getByDoctor($doctorId, $date);
    }

    public function getRecentByPatient(int $patientId, int $limit = 10): iterable
    {
        return $this->repository->getRecentByPatient($patientId, $limit);
    }

    public function createFromAppointment(Appointment $appointment): PatientVisit
    {
        $dto = PatientVisitData::fromAppointment($appointment);
        $model = $this->repository->firstOrCreate(
            ['appointment_id' => $appointment->id],
            $dto->toArray()
        );

        if ($model->wasRecentlyCreated) {
            $this->logActivity('created', $model, $dto->toArray());
        }

        return $model;
    }

    public function createFromRequest(Request $request): PatientVisit
    {
        $model = null;
        $dto = null;

        DB::transaction(function () use ($request, &$model, &$dto) {
            $dto = PatientVisitData::fromRequest($request);
            $model = $this->repository->create($dto->toArray());
        });

        $this->logActivity('created', $model, $dto->toArray());

        return $model;
    }

    public function updateFromRequest(int $id, Request $request): PatientVisit
    {
        $model = $this->repository->findById($id);
        $oldData = $model->getOriginal();
        $dto = null;
        $updatedModel = null;

        DB::transaction(function () use ($request, $model, &$dto, &$updatedModel) {
            $dto = PatientVisitData::fromRequest($request);
            $updatedModel = $this->repository->update($model->id, $dto->toArray());
        });

        $this->logActivity('updated', $updatedModel, ['old' => $oldData, 'new' => $dto->toArray()]);

        return $updatedModel;
    }

    public function checkIn(int $id): PatientVisit
    {
        $visit = $this->repository->update($id, ['check_in_at' => Date::now()]);
        $this->logActivity('checked_in', $visit, ['check_in_at' => $visit->check_in_at]);

        return $visit;
    }

    public function checkOut(int $id): PatientVisit
    {
        $visit = $this->repository->update($id, ['check_out_at' => Date::now()]);
        $this->logActivity('checked_out', $visit, ['check_out_at' => $visit->check_out_at]);

        return $visit;
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
            default => $data,
        };

        activity()
            ->causedBy(auth()->user())
            ->performedOn($model)
            ->withProperties($properties)
            ->log("{$action} ".class_basename($model));
    }
}
