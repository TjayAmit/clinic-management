<?php

namespace App\Repositories;

use App\Models\DentalRecord;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

interface DentalRecordRepository
{
    public function all(): iterable;

    public function findById(int $id): ?DentalRecord;

    public function paginate(array $filters, int $perPage): LengthAwarePaginator;

    public function forCreate(?int $visitId): array;

    public function getByPatient(int $patientId): iterable;

    public function getByDentist(int $dentistId): iterable;

    public function getByPatientVisit(int $patientVisitId): ?DentalRecord;

    public function create(array $data): DentalRecord;

    public function update(int $id, array $data): DentalRecord;

    public function delete(int $id): bool;
}
