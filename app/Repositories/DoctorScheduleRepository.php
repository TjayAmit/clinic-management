<?php

namespace App\Repositories;

use App\Models\DoctorSchedule;

interface DoctorScheduleRepository
{
    public function all(): iterable;

    public function findById(int $id): ?DoctorSchedule;

    public function getByDoctor(int $doctorId): iterable;

    public function getAvailableByDay(int $dayOfWeek): iterable;

    public function upsert(int $doctorId, int $dayOfWeek, array $data): DoctorSchedule;

    public function create(array $data): DoctorSchedule;

    public function update(int $id, array $data): DoctorSchedule;

    public function delete(int $id): bool;
}
