<?php

namespace App\Services;

use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Repositories\DoctorScheduleRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class DoctorScheduleService
{
    public function __construct(
        protected DoctorScheduleRepository $repository,
    ) {}

    public function paginate(Request $request)
    {
        $filters = $request->only(['search']);
        $perPage = $request->integer('per_page', 10);

        return $this->repository->paginate($filters, $perPage);
    }

    public function getByDoctorAndMonth(int $doctorId, int $year, int $month): Collection
    {
        return $this->repository->getByDoctorAndMonth($doctorId, $year, $month);
    }

    public function findById(int $id): ?DoctorSchedule
    {
        return $this->repository->findById($id);
    }

    public function forDoctor(int $doctorId): \Illuminate\Support\Collection
    {
        return $this->repository->forDoctor($doctorId);
    }

    public function updateSchedules(Doctor $doctor, array $schedules): void
    {
        $rows = collect($schedules)
            ->map(fn (array $entry) => [
                'doctor_id'    => $doctor->id,
                'scheduled_date'  => $entry['scheduled_date'],
                'start_time'   => $entry['start_time'] ?? null,
                'end_time'     => $entry['end_time'] ?? null,
                'is_available' => $entry['is_available'],
                'created_at'   => now(),
                'updated_at'   => now(),
            ])
            ->all();

        $this->repository->upsert(
            $rows,
            uniqueBy: ['doctor_id', 'scheduled_date'],
            update: ['start_time', 'end_time', 'is_available', 'updated_at'],
        );
    }

    public function createForDoctor(Doctor $doctor, array $data): DoctorSchedule
    {
        return $doctor->schedules()->create($data);
    }

    public function delete(int $id): bool
    {
        return $this->repository->delete($id);
    }

    public function createIndividual(int $doctorId, array $validated): int
    {
        $dates = (array) ($validated['scheduled_date'] ?? []);
        $count = 0;

        foreach ($dates as $date) {
            DoctorSchedule::create([
                'doctor_id'    => $doctorId,
                'scheduled_date'  => $date,
                'start_time'   => $validated['start_time'] ?? null,
                'end_time'     => $validated['end_time'] ?? null,
                'is_available' => $validated['is_available'],
            ]);
            $count++;
        }

        return $count;
    }

    public function updateIndividual(DoctorSchedule $schedule, array $validated): int
    {
        $doctorId = $schedule->doctor_id;
        $dates = (array) ($validated['scheduled_date'] ?? []);

        // Delete the original schedule
        $schedule->delete();

        // Create new schedules for all selected dates
        $count = 0;
        foreach ($dates as $date) {
            DoctorSchedule::create([
                'doctor_id'    => $doctorId,
                'scheduled_date'  => $date,
                'start_time'   => $validated['start_time'] ?? null,
                'end_time'     => $validated['end_time'] ?? null,
                'is_available' => $validated['is_available'],
            ]);
            $count++;
        }

        return $count;
    }

    public function getAuthDoctor(): ?Doctor
    {
        return auth()->user()->doctor?->load('user');
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
