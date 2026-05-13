<?php

namespace App\Repositories;

use App\Models\DentalRecord;

interface DentalRecordRepository
{
    public function all(): iterable;

    public function findById(int $id): ?DentalRecord;

    public function getByPatient(int $patientId): iterable;

    public function getByDentist(int $dentistId): iterable;

    public function getByPatientVisit(int $patientVisitId): ?DentalRecord;

    public function create(array $data): DentalRecord;

    public function update(int $id, array $data): DentalRecord;

    public function delete(int $id): bool;
}
