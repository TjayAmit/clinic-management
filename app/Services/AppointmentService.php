<?php

namespace App\Services;

use App\DTOs\AppointmentData;
use App\Models\Appointment;
use App\Repositories\AppointmentRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AppointmentService
{
    public function __construct(
        protected AppointmentRepository $repository,
    ) {}

    public function all(): iterable
    {
        return $this->repository->all();
    }

    public function findById(int $id): ?Appointment
    {
        return $this->repository->findById($id);
    }

    public function getByDoctor(int $doctorId, ?string $date = null): iterable
    {
        return $this->repository->getByDoctor($doctorId, $date);
    }

    public function getByPatient(int $patientId): iterable
    {
        return $this->repository->getByPatient($patientId);
    }

    public function getByDate(string $date): iterable
    {
        return $this->repository->getByDate($date);
    }

    public function getByStatus(string $status): iterable
    {
        return $this->repository->getByStatus($status);
    }

    public function checkConflict(int $doctorId, string $date, string $start, string $end, ?int $excludeId = null): bool
    {
        return $this->repository->checkConflict($doctorId, $date, $start, $end, $excludeId);
    }

    public function createFromRequest(Request $request): Appointment
    {
        $model = null;
        $dto = null;

        DB::transaction(function () use ($request, &$model, &$dto) {
            $dto = AppointmentData::fromRequest($request);
            $model = $this->repository->create($dto->toArray());
        });

        $this->logActivity('created', $model, $dto->toArray());

        return $model;
    }

    public function updateFromRequest(int $id, Request $request): Appointment
    {
        $model = $this->repository->findById($id);
        $oldData = $model->getOriginal();
        $dto = null;
        $updatedModel = null;

        DB::transaction(function () use ($request, $model, &$dto, &$updatedModel) {
            $dto = AppointmentData::fromRequest($request);
            $updatedModel = $this->repository->update($model->id, $dto->toArray());
        });

        $this->logActivity('updated', $updatedModel, ['old' => $oldData, 'new' => $dto->toArray()]);

        return $updatedModel;
    }

    public function confirm(int $id): Appointment
    {
        $appointment = $this->repository->updateStatus($id, 'confirmed');

        // Notify the doctor
        $appointment->load('doctor.user', 'patient', 'service');
        $appointment->doctor->user->notify(
            new \App\Notifications\AppointmentConfirmed($appointment)
        );

        $this->logActivity('confirmed', $appointment, ['status' => 'confirmed']);

        return $appointment;
    }

    public function cancel(int $id): Appointment
    {
        $appointment = $this->repository->updateStatus($id, 'cancelled');
        $this->logActivity('cancelled', $appointment, ['status' => 'cancelled']);

        return $appointment;
    }

    public function complete(int $id): Appointment
    {
        $appointment = $this->repository->updateStatus($id, 'completed');
        $this->logActivity('completed', $appointment, ['status' => 'completed']);

        return $appointment;
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
            'created'   => ['new_data' => $data],
            'updated'   => $data,
            'deleted'   => ['deleted_data' => $data, 'deleted_by' => auth()->id()],
            default     => $data,
        };

        activity()
            ->causedBy(auth()->user())
            ->performedOn($model)
            ->withProperties($properties)
            ->log("{$action} " . class_basename($model));
    }
}
