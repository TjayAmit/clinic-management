<?php

namespace App\Repositories;

use App\Models\PatientVisit;
use Illuminate\Pagination\LengthAwarePaginator;

interface PatientVisitRepository
{
    public function all(): iterable;

    public function findById(int $id): ?PatientVisit;

    public function paginate(array $filters, int $perPage): LengthAwarePaginator;

    public function getFormDependencies(bool $excludeTerminal = false): array;

    public function getByPatient(int $patientId): iterable;

    public function getByDoctor(int $doctorId, ?string $date = null): iterable;

    public function getByAppointment(int $appointmentId): ?PatientVisit;

    public function getRecentByPatient(int $patientId, int $limit = 10): iterable;

    public function create(array $data): PatientVisit;

    public function firstOrCreate(array $attributes, array $values = []): PatientVisit;

    public function update(int $id, array $data): PatientVisit;

    public function delete(int $id): bool;
}
