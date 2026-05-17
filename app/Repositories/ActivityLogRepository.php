<?php

namespace App\Repositories;

use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Spatie\Activitylog\Models\Activity;

interface ActivityLogRepository
{
    public function paginate(array $filters, int $perPage): LengthAwarePaginator;

    public function findById(int $id): Activity;

    public function delete(int $id): bool;

    public function distinctLogNames(): Collection;

    public function distinctEvents(): Collection;
}
