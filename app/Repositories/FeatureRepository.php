<?php

namespace App\Repositories;

use App\Models\Feature;

interface FeatureRepository
{
    public function all(): iterable;

    public function findById(int $id): ?Feature;

    public function findByKey(string $key): ?Feature;

    public function getEnabled(): iterable;

    public function create(array $data): Feature;

    public function update(int $id, array $data): Feature;

    public function delete(int $id): bool;

    public function enable(int $id, int $userId): Feature;

    public function disable(int $id): Feature;
}
