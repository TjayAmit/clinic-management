<?php

namespace App\Repositories\Eloquent;

use App\Models\Feature;
use App\Repositories\FeatureRepository;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class EloquentFeatureRepository implements FeatureRepository
{
    public function all(): array
    {
        return Feature::with('enabledBy')->get()->toArray();
    }

    public function paginate(int $perPage = 10): LengthAwarePaginator
    {
        return Feature::with('enabledBy')
            ->latest()
            ->paginate($perPage);
    }

    public function findById(int $id): ?Feature
    {
        return Feature::with('enabledBy')->find($id);
    }

    public function findByKey(string $key): ?Feature
    {
        return Feature::with('enabledBy')->byKey($key)->first();
    }

    public function create(array $data): Feature
    {
        return Feature::create($data);
    }

    public function update(int $id, array $data): Feature
    {
        $Feature = Feature::findOrFail($id);
        $Feature->update($data);

        return $Feature->fresh();
    }

    public function delete(int $id): bool
    {
        $Feature = Feature::findOrFail($id);

        return $Feature->delete();
    }

    public function enable(int $id, int $enabledBy): Feature
    {
        $Feature = Feature::findOrFail($id);
        $Feature->update([
            'is_enabled' => true,
            'enabled_by' => $enabledBy,
            'enabled_at' => now(),
        ]);

        return $Feature->fresh();
    }

    public function disable(int $id): Feature
    {
        $Feature = Feature::findOrFail($id);
        $Feature->update([
            'is_enabled' => false,
            'enabled_by' => null,
            'enabled_at' => null,
        ]);

        return $Feature->fresh();
    }

    public function getEnabled(): array
    {
        return Feature::enabled()->with('enabledBy')->get()->toArray();
    }

    public function getDisabled(): array
    {
        return Feature::disabled()->with('enabledBy')->get()->toArray();
    }

    public function getAllEnabled(): Collection
    {
        return Feature::enabled()->get();
    }
}
