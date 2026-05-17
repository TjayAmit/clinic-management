<?php

namespace App\Services;

use App\Repositories\ActivityLogRepository;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

class ActivityLogService
{
    public function __construct(
        protected ActivityLogRepository $repository,
    ) {}

    public function paginate(Request $request): array
    {
        $filters = $request->only(['search', 'log_name', 'event', 'per_page']);
        $perPage = $request->integer('per_page', 10);

        return [
            'data' => $this->repository->paginate($filters, $perPage),
            'filters' => $filters,
            'logNames' => $this->repository->distinctLogNames(),
            'events' => $this->repository->distinctEvents(),
        ];
    }

    public function findById(int $id): Activity
    {
        return $this->repository->findById($id);
    }

    public function delete(int $id): bool
    {
        return $this->repository->delete($id);
    }
}
