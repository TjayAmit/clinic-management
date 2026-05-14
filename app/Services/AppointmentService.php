<?php

namespace App\Services;

use App\DTOs\AppointmentData;
use App\Models\Appointment;
use App\Notifications\AppointmentBooked;
use App\Notifications\AppointmentCancelled;
use App\Notifications\AppointmentCompleted;
use App\Notifications\AppointmentConfirmed;
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

    public function getWalkInsByDate(string $date): iterable
    {
        return $this->repository->getWalkInsByDate($date);
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

        $model->load('doctor.user', 'patient', 'service');
        $model->patient->notify(new AppointmentBooked($model, 'patient'));
        $model->doctor->user->notify(new AppointmentBooked($model, 'doctor'));

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

        $appointment->load('doctor.user', 'patient', 'service');
        $appointment->doctor->user->notify(new AppointmentCancelled($appointment, 'doctor'));
        $appointment->patient->notify(new AppointmentConfirmed($appointment, 'patient'));

        $this->logActivity('confirmed', $appointment, ['status' => 'confirmed']);

        return $appointment;
    }

    public function markInQueue(int $id): Appointment
    {
        $appointment = $this->repository->updateStatus($id, 'in_queue');
        $this->logActivity('marked_in_queue', $appointment, ['status' => 'in_queue']);

        return $appointment;
    }

    public function markInProgress(int $id): Appointment
    {
        $appointment = $this->repository->updateStatus($id, 'in_progress');
        $this->logActivity('marked_in_progress', $appointment, ['status' => 'in_progress']);

        return $appointment;
    }

    public function needsFollowUp(int $id): Appointment
    {
        $appointment = $this->repository->updateStatus($id, 'needs_follow_up');
        $this->logActivity('needs_follow_up', $appointment, ['status' => 'needs_follow_up']);

        return $appointment;
    }

    public function cancel(int $id): Appointment
    {
        $appointment = $this->repository->updateStatus($id, 'cancelled');

        $appointment->load('dentist.user', 'patient', 'service');
        $appointment->patient->notify(new AppointmentCancelled($appointment, 'patient'));
        $appointment->dentist->user->notify(new AppointmentCancelled($appointment, 'doctor'));

        $this->logActivity('cancelled', $appointment, ['status' => 'cancelled']);

        return $appointment;
    }

    public function complete(int $id): Appointment
    {
        $appointment = $this->repository->updateStatus($id, 'completed');

        $appointment->load('doctor.user', 'patient', 'service');
        $appointment->patient->notify(new AppointmentCompleted($appointment));

        $this->logActivity('completed', $appointment, ['status' => 'completed']);

        return $appointment;
    }

    public function noShow(int $id): Appointment
    {
        $appointment = $this->repository->updateStatus($id, 'no_show');
        $this->logActivity('no_show', $appointment, ['status' => 'no_show']);

        return $appointment;
    }

    public function createFollowUp(Appointment $parent, Request $request): Appointment
    {
        $followUp = null;
        $dto = null;

        DB::transaction(function () use ($parent, $request, &$followUp, &$dto) {
            $dto = AppointmentData::fromRequest($request);
            $data = $dto->toArray();
            $data['parent_appointment_id'] = $parent->id;
            $data['patient_id'] = $parent->patient_id;
            $data['doctor_id'] = $parent->doctor_id;
            $data['service_id'] = $parent->service_id;
            $followUp = $this->repository->create($data);
        });

        $this->logActivity('created_follow_up', $followUp, [
            'parent_id' => $parent->id,
            'new_data'  => $dto->toArray(),
        ]);

        return $followUp;
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
            'created', 'created_follow_up' => ['new_data' => $data],
            'updated'                      => $data,
            'deleted'                      => ['deleted_data' => $data, 'deleted_by' => auth()->id()],
            default                        => $data,
        };

        activity()
            ->causedBy(auth()->user())
            ->performedOn($model)
            ->withProperties($properties)
            ->log("{$action} " . class_basename($model));
    }
}
