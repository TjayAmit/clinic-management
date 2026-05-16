<?php

namespace App\Services;

use App\DTOs\DoctorAvailabilityData;
use App\DTOs\DoctorData;
use App\Enums\AppointmentStatus;
use App\Models\Doctor;
use App\Models\User;
use App\Repositories\DoctorRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DoctorService
{
    public function __construct(
        protected DoctorRepository $repository,
    ) {}

    public function all(): iterable
    {
        return $this->repository->all();
    }

    public function findById(int $id): ?Doctor
    {
        return $this->repository->findById($id);
    }

    public function findByUserId(int $userId): ?Doctor
    {
        return $this->repository->findByUserId($userId);
    }

    public function getActive(): iterable
    {
        return $this->repository->getActive();
    }

    public function findWithSchedules(int $id): ?Doctor
    {
        return $this->repository->findWithSchedules($id);
    }

    /**
     * Get doctor availability for today
     * Returns list of doctors with their next available time slot after all appointments
     */
    public function getTodayAvailability(): array
    {
        $today = Carbon::today();
        $dayOfWeek = $today->dayOfWeek; // 0 (Sunday) to 6 (Saturday)

        $doctors = Doctor::with(['user', 'schedules'])
            ->where('is_active', true)
            ->get();

        $availability = [];

        foreach ($doctors as $doctor) {
            // Get today's schedule for this doctor
            $schedule = $doctor->schedules
                ->where('day_of_week', $dayOfWeek)
                ->where('is_available', true)
                ->first();

            if (! $schedule) {
                // Doctor not available today
                $availability[] = new DoctorAvailabilityData(
                    doctor_id: $doctor->id,
                    doctor_name: $doctor->user->name,
                    specialization: $doctor->specialization,
                    available_from: null,
                    available_until: null,
                    is_available_today: false,
                );
                continue;
            }

            // Get today's appointments for this doctor (excluding cancelled/no_show)
            $appointments = $doctor->appointments()
                ->whereDate('appointment_date', $today)
                ->whereNotIn('status', [AppointmentStatus::Cancelled, AppointmentStatus::NoShow])
                ->orderBy('start_time')
                ->get();

            if ($appointments->isEmpty()) {
                // No appointments today, available from schedule start
                $availability[] = new DoctorAvailabilityData(
                    doctor_id: $doctor->id,
                    doctor_name: $doctor->user->name,
                    specialization: $doctor->specialization,
                    available_from: $schedule->start_time,
                    available_until: $schedule->end_time,
                    is_available_today: true,
                );
                continue;
            }

            // Find the latest appointment end time
            $lastAppointment = $appointments->last();
            $lastEndTime = $lastAppointment->end_time;

            // If the last appointment ends after schedule end, not available
            if ($lastEndTime >= $schedule->end_time) {
                $availability[] = new DoctorAvailabilityData(
                    doctor_id: $doctor->id,
                    doctor_name: $doctor->user->name,
                    specialization: $doctor->specialization,
                    available_from: null,
                    available_until: null,
                    is_available_today: false,
                );
                continue;
            }

            // Available from last appointment end time to schedule end time
            $availability[] = new DoctorAvailabilityData(
                doctor_id: $doctor->id,
                doctor_name: $doctor->user->name,
                specialization: $doctor->specialization,
                available_from: $lastEndTime,
                available_until: $schedule->end_time,
                is_available_today: true,
            );
        }

        return $availability;
    }

    public function createFromRequest(Request $request): Doctor
    {
        $model = null;
        $dto = null;

        DB::transaction(function () use ($request, &$model, &$dto) {
            // Create user account with generated password
            // TODO: In the future, implement proper password system and send credentials via email
            $password = $this->generateRandomPassword();
            $user = User::create([
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'password' => bcrypt($password),
            ]);

            $dto = DoctorData::fromRequest($request);
            $data = $dto->toArray();
            $data['user_id'] = $user->id;
            $model = $this->repository->create($data);
        });

        $this->logActivity('created', $model, $dto->toArray());

        return $model;
    }

    private function generateRandomPassword(): string
    {
        return Str::random(16);
    }

    public function updateFromRequest(int $id, Request $request): Doctor
    {
        $model = $this->repository->findById($id);
        $oldData = $model->getOriginal();
        $dto = null;
        $updatedModel = null;

        DB::transaction(function () use ($request, $model, &$dto, &$updatedModel) {
            $dto = DoctorData::fromRequest($request);
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
