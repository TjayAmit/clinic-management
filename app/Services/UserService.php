<?php

namespace App\Services;

use App\DTOs\UserData;
use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserService
{
    public function __construct(
        protected UserRepository $repository
    ) {}

    public function all(): iterable
    {
        return $this->repository->all();
    }

    public function findById(int $id): ?User
    {
        return $this->repository->findById($id);
    }

    public function paginate(array $filters, int $perPage): \Illuminate\Pagination\LengthAwarePaginator
    {
        return $this->repository->paginate($filters, $perPage);
    }

    public function createFromRequest(Request $request): User
    {
        $model = null;
        $dto = null;

        DB::transaction(function () use ($request, &$model, &$dto) {
            $dto = UserData::fromRequest($request);
            $model = $this->repository->create($dto->toArray());
        });

        $this->logActivity('created', $model, $dto->toArray());

        return $model;
    }

    public function updateFromRequest(int $id, Request $request): User
    {
        $model = $this->repository->findById($id);
        $oldData = $model->getOriginal();
        $dto = null;
        $updatedModel = null;

        DB::transaction(function () use ($request, $model, &$dto, &$updatedModel) {
            $dto = UserData::fromRequest($request);
            $updatedModel = $this->repository->update($model->id, $dto->toArray());
        });

        $this->logActivity('updated', $updatedModel, [
            'old' => $oldData,
            'new' => $dto->toArray(),
        ]);

        return $updatedModel;
    }

    public function delete(int $id): bool
    {
        $model = $this->repository->findById($id);
        $data = $model->toArray();
        $result = false;

        DB::transaction(function () use ($id, &$result) {
            $result = $this->repository->delete($id);
        });

        $this->logActivity('deleted', $model, $data);

        return $result;
    }

    public function createFromDTO(UserData $dto): User
    {
        $model = null;

        DB::transaction(function () use ($dto, &$model) {
            $model = $this->repository->create($dto->toArray());
        });

        $this->logActivity('created', $model, $dto->toArray());

        return $model;
    }

    public function updateFromDTO(int $id, UserData $dto): User
    {
        $model = $this->repository->findById($id);
        $oldData = $model->getOriginal();
        $updatedModel = null;

        DB::transaction(function () use ($id, $dto, &$updatedModel) {
            $updatedModel = $this->repository->update($id, $dto->toArray());
        });

        $this->logActivity('updated', $updatedModel, [
            'old' => $oldData,
            'new' => $dto->toArray(),
        ]);

        return $updatedModel;
    }

    private function logActivity(string $action, Model $model, array $data = []): void
    {
        $properties = [];

        if ($action === 'updated') {
            $properties = $data;
        }

        if ($action === 'deleted') {
            $properties['deleted_data'] = $data;
            $properties['deleted_by'] = auth()->id();
        }

        if ($action === 'created') {
            $properties['new_data'] = $data;
        }

        activity()
            ->causedBy(auth()->user())
            ->performedOn($model)
            ->withProperties($properties)
            ->log("{$action} ".class_basename($model));
    }
}
