<?php

namespace App\Repositories\Eloquent;

use App\Repositories\ActivityLogRepository;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Spatie\Activitylog\Models\Activity;

class EloquentActivityLogRepository implements ActivityLogRepository
{
    public function paginate(array $filters, int $perPage): LengthAwarePaginator
    {
        $query = Activity::query()->with(['subject', 'causer']);

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('log_name', 'like', "%{$search}%")
                    ->orWhere('event', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['log_name'])) {
            $query->where('log_name', $filters['log_name']);
        }

        if (! empty($filters['event'])) {
            $query->where('event', $filters['event']);
        }

        return $query->latest()->paginate($perPage)->withQueryString();
    }

    public function findById(int $id): Activity
    {
        return Activity::with(['subject', 'causer'])->findOrFail($id);
    }

    public function delete(int $id): bool
    {
        $activity = Activity::findOrFail($id);

        return $activity->delete();
    }

    public function distinctLogNames(): Collection
    {
        return Activity::distinct()->pluck('log_name')->filter()->values();
    }

    public function distinctEvents(): Collection
    {
        return Activity::distinct()->pluck('event')->filter()->values();
    }
}
