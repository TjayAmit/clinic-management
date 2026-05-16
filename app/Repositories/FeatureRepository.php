<?php

namespace App\Repositories;

use App\Models\Feature;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface FeatureRepository
{
    public function all(): array;

    public function paginate(int $perPage = 10): LengthAwarePaginator;

    public function findById(int $id): ?Feature;

    public function findByKey(string $key): ?Feature;

    public function create(array $data): Feature;

    public function update(int $id, array $data): Feature;

    public function delete(int $id): bool;

    public function enable(int $id, int $enabledBy): Feature;

    public function disable(int $id): Feature;

    public function getEnabled(): array;

    public function getDisabled(): array;

    /**
     * Get all enabled feature flags as a collection.
     *
     * @return Collection<int, Feature>
     */
    public function getAllEnabled(): Collection;
}
