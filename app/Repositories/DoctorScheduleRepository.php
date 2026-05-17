<?php

namespace App\Repositories;

use App\Models\DoctorSchedule;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface DoctorScheduleRepository
{
    public function findById(int $id): DoctorSchedule;

    public function forDoctor(int $doctorId): Collection;

    public function getByDoctorAndMonth(int $doctorId, int $year, int $month): Collection;

    public function upsert(array $rows, array $uniqueBy, array $update): void;

    public function create(array $data): DoctorSchedule;

    public function delete(int $id): bool;

    public function paginate(array $filters, int $perPage): LengthAwarePaginator;
}
