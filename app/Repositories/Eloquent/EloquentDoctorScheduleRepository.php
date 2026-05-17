<?php

namespace App\Repositories\Eloquent;

use App\Models\DoctorSchedule;
use App\Repositories\DoctorScheduleRepository;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class EloquentDoctorScheduleRepository implements DoctorScheduleRepository
{
    public function findById(int $id): DoctorSchedule
    {
        return DoctorSchedule::with(['doctor.user'])->findOrFail($id);
    }

    public function forDoctor(int $doctorId): Collection
    {
        return DoctorSchedule::where('doctor_id', $doctorId)
            ->orderBy('scheduled_date')
            ->get();
    }

    public function getByDoctorAndMonth(int $doctorId, int $year, int $month): Collection
    {
        return DoctorSchedule::where('doctor_id', $doctorId)
            ->whereYear('scheduled_date', $year)
            ->whereMonth('scheduled_date', $month)
            ->where('is_available', true)
            ->orderBy('scheduled_date')
            ->orderBy('start_time')
            ->get();
    }

    public function upsert(array $rows, array $uniqueBy, array $update): void
    {
        DoctorSchedule::upsert($rows, uniqueBy: $uniqueBy, update: $update);
    }

    public function create(array $data): DoctorSchedule
    {
        return DoctorSchedule::create($data);
    }

    public function delete(int $id): bool
    {
        $schedule = DoctorSchedule::findOrFail($id);

        return $schedule->delete();
    }

    public function paginate(array $filters, int $perPage): LengthAwarePaginator
    {
        $query = DoctorSchedule::with(['doctor.user']);

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('doctor.user', fn ($u) => $u->where('name', 'like', "%{$search}%"));
        }

        return $query->latest()->paginate($perPage)->withQueryString();
    }
}
