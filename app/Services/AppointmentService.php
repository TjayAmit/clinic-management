<?php

namespace App\Services;

use App\DTOs\AppointmentData;
use App\Models\Appointment;
use App\Models\DoctorSchedule;
use App\Notifications\AppointmentBooked;
use App\Notifications\AppointmentCancelled;
use App\Notifications\AppointmentCompleted;
use App\Notifications\AppointmentConfirmed;
use App\Repositories\AppointmentRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AppointmentService
{
    public function __construct(
        protected AppointmentRepository $repository,
        protected PatientVisitService $patientVisitService,
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

    private function assertDoctorAvailable(int $doctorId, string $appointmentDate): void
    {
        $dayOfWeek = Carbon::parse($appointmentDate)->dayOfWeek;

        // Check if doctor has an available schedule for this day.
        // If no schedules exist at all for this doctor, the query returns false,
        // which means we treat them as available everywhere (no restrictions).
        $hasSchedule = DoctorSchedule::where('doctor_id', $doctorId)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_available', true)
            ->exists();

        // Only enforce the restriction if the doctor has schedules configured
        // and none of them are available for this specific day.
        $doctorHasAnySchedules = DoctorSchedule::where('doctor_id', $doctorId)->exists();

        if ($doctorHasAnySchedules && ! $hasSchedule) {
            throw ValidationException::withMessages([
                'appointment_date' => 'Doctor is not available on this day.',
            ]);
        }
    }

    public function createFromRequest(Request $request): Appointment
    {
        $this->assertDoctorAvailable(
            (int) $request->input('doctor_id'),
            $request->input('appointment_date'),
        );

        $model = null;
        $dto = null;

        DB::transaction(function () use ($request, &$model, &$dto) {
            $dto = AppointmentData::fromRequest($request);
            $model = $this->repository->create($dto->toArray());
        });

        $this->logActivity('created', $model, $dto->toArray());

        $model->load('doctor.user', 'patient', 'service');
        if ($model->patient) {
            $model->patient->notify(new AppointmentBooked($model, 'patient'));
        }
        $model->doctor->user->notify(new AppointmentBooked($model, 'doctor'));

        return $model;
    }

    public function updateFromRequest(int $id, Request $request): Appointment
    {
        $this->assertDoctorAvailable(
            (int) $request->input('doctor_id'),
            $request->input('appointment_date'),
        );

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
        $appointment->doctor->user->notify(new AppointmentConfirmed($appointment, 'doctor'));
        if ($appointment->patient) {
            $appointment->patient->notify(new AppointmentConfirmed($appointment, 'patient'));
        }

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

        $appointment->load('doctor.user', 'patient', 'service');
        if ($appointment->patient) {
            $appointment->patient->notify(new AppointmentCancelled($appointment, 'patient'));
        }
        $appointment->doctor->user->notify(new AppointmentCancelled($appointment, 'doctor'));

        $this->logActivity('cancelled', $appointment, ['status' => 'cancelled']);

        return $appointment;
    }

    public function complete(int $id): Appointment
    {
        $appointment = null;

        DB::transaction(function () use ($id, &$appointment) {
            $appointment = $this->repository->updateStatus($id, 'completed');
            // Walk-in appointments for unregistered patients (patient_id is null) produce no PatientVisit record.
            // Only registered patients get a visit record upon appointment completion.
            if ($appointment->patient_id !== null) {
                $this->patientVisitService->createFromAppointment($appointment);
            }
        });

        $appointment->load('doctor.user', 'patient', 'service');
        if ($appointment->patient) {
            $appointment->patient->notify(new AppointmentCompleted($appointment));
        }

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
            // Copy walk-in fields from parent unless explicitly overridden in the request
            if (! isset($data['is_walk_in'])) {
                $data['is_walk_in'] = $parent->is_walk_in;
            }
            if (! isset($data['walk_in_name'])) {
                $data['walk_in_name'] = $parent->walk_in_name;
            }
            $followUp = $this->repository->create($data);
        });

        $this->logActivity('created_follow_up', $followUp, [
            'parent_id' => $parent->id,
            'new_data' => $dto->toArray(),
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
