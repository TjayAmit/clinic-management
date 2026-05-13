<?php

namespace App\Repositories;

use App\Models\PatientVisit;

interface PatientVisitRepository
{
    public function all(): iterable;

    public function findById(int $id): ?PatientVisit;

    public function getByPatient(int $patientId): iterable;

    public function getByDoctor(int $doctorId, ?string $date = null): iterable;

    public function getByAppointment(int $appointmentId): ?PatientVisit;

    public function getRecentByPatient(int $patientId, int $limit = 10): iterable;

    public function create(array $data): PatientVisit;

    public function update(int $id, array $data): PatientVisit;

    public function delete(int $id): bool;
}
