<?php

namespace App\Repositories;

use App\Models\Appointment;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

interface AppointmentRepository
{
    public function all(): iterable;

    public function findById(int $id): ?Appointment;

    public function paginate(User $user, array $filters, int $perPage): LengthAwarePaginator;

    public function getFormDependencies(): array;

    public function getActiveDoctors(): iterable;

    public function getByDoctor(int $doctorId, ?string $date = null): iterable;

    public function getByPatient(int $patientId): iterable;

    public function getByDate(string $date): iterable;

    public function getByStatus(string $status): iterable;

    public function getWalkInsByDate(string $date): iterable;

    public function updateStatus(int $id, string $status): Appointment;

    public function checkConflict(int $doctorId, string $date, string $startTime, string $endTime, ?int $excludeId = null): bool;

    public function create(array $data): Appointment;

    public function update(int $id, array $data): Appointment;

    public function delete(int $id): bool;
}
