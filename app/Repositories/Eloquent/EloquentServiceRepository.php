<?php

namespace App\Repositories\Eloquent;

use App\Models\Service;
use App\Repositories\ServiceRepository;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentServiceRepository implements ServiceRepository
{
    public function all(): iterable
    {
        return Service::all();
    }

    public function findById(int $id): ?Service
    {
        return Service::find($id);
    }

    public function paginate(array $filters, int $perPage): LengthAwarePaginator
    {
        $query = Service::query();

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where('name', 'like', "%{$search}%");
        }

        if (! empty($filters['active_only'])) {
            $query->where('is_active', true);
        }

        return $query->latest()->paginate($perPage)->withQueryString();
    }

    public function getActive(): iterable
    {
        return Service::where('is_active', true)->get();
    }

    public function create(array $data): Service
    {
        return Service::create($data);
    }

    public function update(int $id, array $data): Service
    {
        $service = $this->findById($id);
        $service->update($data);

        return $service;
    }

    public function delete(int $id): bool
    {
        $service = $this->findById($id);

        return $service->delete();
    }
}
