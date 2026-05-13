<?php

namespace App\Repositories\Eloquent;

use App\Models\Feature;
use App\Repositories\FeatureRepository;

class EloquentFeatureRepository implements FeatureRepository
{
    public function all(): iterable
    {
        return Feature::all();
    }

    public function findById(int $id): ?Feature
    {
        return Feature::find($id);
    }

    public function findByKey(string $key): ?Feature
    {
        return Feature::where('key', $key)->first();
    }

    public function getEnabled(): iterable
    {
        return Feature::where('is_enabled', true)->get();
    }

    public function create(array $data): Feature
    {
        return Feature::create($data);
    }

    public function update(int $id, array $data): Feature
    {
        $feature = $this->findById($id);
        $feature->update($data);

        return $feature;
    }

    public function delete(int $id): bool
    {
        $feature = $this->findById($id);

        return $feature->delete();
    }

    public function enable(int $id, int $userId): Feature
    {
        $feature = $this->findById($id);
        $feature->update([
            'is_enabled' => true,
            'enabled_by' => $userId,
            'enabled_at' => now(),
        ]);

        return $feature;
    }

    public function disable(int $id): Feature
    {
        $feature = $this->findById($id);
        $feature->update([
            'is_enabled' => false,
            'enabled_by' => null,
            'enabled_at' => null,
        ]);

        return $feature;
    }
}
