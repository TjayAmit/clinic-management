<?php

namespace App\Repositories;

use App\Models\MedicalRecord;

interface MedicalRecordRepository
{
    public function all(): iterable;

    public function findById(int $id): ?MedicalRecord;

    public function getByPatient(int $patientId): iterable;

    public function getByDoctor(int $doctorId): iterable;

    public function getByPatientVisit(int $patientVisitId): ?MedicalRecord;

    public function create(array $data): MedicalRecord;

    public function update(int $id, array $data): MedicalRecord;

    public function delete(int $id): bool;
}
