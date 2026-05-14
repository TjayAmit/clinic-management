<?php

namespace App\Repositories;

use App\Models\Queue;

interface QueueRepository
{
    public function getByDate(string $date): iterable;

    public function getByDateAndDoctor(string $date, int $doctorId): iterable;

    public function findById(int $id): ?Queue;

    public function findByAppointmentAndDate(int $appointmentId, string $date): ?Queue;

    public function getNextPosition(string $date): int;

    public function create(array $data): Queue;

    public function update(int $id, array $data): Queue;

    public function reorder(string $date, array $orderedIds): void;

    public function delete(int $id): bool;
}
