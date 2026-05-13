<?php

namespace App\Services;

use App\DTOs\DoctorData;
use App\Models\Doctor;
use App\Repositories\DoctorRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DoctorService
{
    public function __construct(
        protected DoctorRepository $repository,
    ) {}

    public function all(): iterable
    {
        return $this->repository->all();
    }

    public function findById(int $id): ?Doctor
    {
        return $this->repository->findById($id);
    }

    public function findByUserId(int $userId): ?Doctor
    {
        return $this->repository->findByUserId($userId);
    }

    public function getActive(): iterable
    {
        return $this->repository->getActive();
    }

    public function findWithSchedules(int $id): ?Doctor
    {
        return $this->repository->findWithSchedules($id);
    }

    public function createFromRequest(Request $request): Doctor
    {
        $model = null;
        $dto = null;

        DB::transaction(function () use ($request, &$model, &$dto) {
            // Create user account with generated password
            // TODO: In the future, implement proper password system and send credentials via email
            $password = $this->generateRandomPassword();
            $user = \App\Models\User::create([
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'password' => bcrypt($password),
            ]);

            $dto = DoctorData::fromRequest($request);
            $data = $dto->toArray();
            $data['user_id'] = $user->id;
            $model = $this->repository->create($data);
        });

        $this->logActivity('created', $model, $dto->toArray());

        return $model;
    }

    private function generateRandomPassword(): string
    {
        return \Illuminate\Support\Str::random(16);
    }

    public function updateFromRequest(int $id, Request $request): Doctor
    {
        $model = $this->repository->findById($id);
        $oldData = $model->getOriginal();
        $dto = null;
        $updatedModel = null;

        DB::transaction(function () use ($request, $model, &$dto, &$updatedModel) {
            $dto = DoctorData::fromRequest($request);
            $updatedModel = $this->repository->update($model->id, $dto->toArray());
        });

        $this->logActivity('updated', $updatedModel, ['old' => $oldData, 'new' => $dto->toArray()]);

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

    private function logActivity(string $action, Model $model, array $data = []): void
    {
        $properties = match ($action) {
            'created' => ['new_data' => $data],
            'updated' => $data,
            'deleted' => ['deleted_data' => $data, 'deleted_by' => auth()->id()],
            default   => [],
        };

        activity()
            ->causedBy(auth()->user())
            ->performedOn($model)
            ->withProperties($properties)
            ->log("{$action} " . class_basename($model));
    }
}
