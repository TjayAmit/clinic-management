<?php

namespace App\Services;

use App\DTOs\QueueData;
use App\Enums\QueueStatus;
use App\Models\Queue;
use App\Repositories\QueueRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;

class QueueService
{
    public function __construct(
        protected QueueRepository $repository,
    ) {}

    public function getToday(): iterable
    {
        return $this->repository->getByDate(Date::today()->toDateString());
    }

    public function getByDate(string $date): iterable
    {
        return $this->repository->getByDate($date);
    }

    public function getByDateAndDoctor(string $date, int $doctorId): iterable
    {
        return $this->repository->getByDateAndDoctor($date, $doctorId);
    }

    public function findById(int $id): ?Queue
    {
        return $this->repository->findById($id);
    }

    public function addToQueue(Request $request): Queue
    {
        $model = null;

        DB::transaction(function () use ($request, &$model) {
            $date = $request->input('queue_date', Date::today()->toDateString());
            $position = $this->repository->getNextPosition($date);

            $model = $this->repository->create([
                'appointment_id' => $request->input('appointment_id'),
                'queue_date'     => $date,
                'position'       => $position,
                'status'         => QueueStatus::Waiting->value,
            ]);
        });

        $this->logActivity('added_to_queue', $model, $model->toArray());

        return $model;
    }

    public function callNext(int $id): Queue
    {
        $queue = $this->repository->update($id, [
            'status'    => QueueStatus::InProgress->value,
            'called_at' => Date::now(),
        ]);

        $this->logActivity('called', $queue, ['called_at' => $queue->called_at]);

        return $queue;
    }

    public function markCompleted(int $id): Queue
    {
        $queue = $this->repository->update($id, [
            'status'       => QueueStatus::Completed->value,
            'completed_at' => Date::now(),
        ]);

        $this->logActivity('completed', $queue, ['completed_at' => $queue->completed_at]);

        return $queue;
    }

    public function markNoShow(int $id): Queue
    {
        $queue = $this->repository->update($id, [
            'status' => QueueStatus::NoShow->value,
        ]);

        $this->logActivity('no_show', $queue, ['status' => 'no_show']);

        return $queue;
    }

    public function reorder(string $date, array $orderedIds): void
    {
        DB::transaction(function () use ($date, $orderedIds) {
            $this->repository->reorder($date, $orderedIds);
        });
    }

    public function update(int $id, Request $request): Queue
    {
        $model = $this->repository->findById($id);
        $dto = QueueData::fromRequest($request);
        $updated = null;

        DB::transaction(function () use ($id, $dto, &$updated) {
            $updated = $this->repository->update($id, $dto->toArray());
        });

        $this->logActivity('updated', $updated, $dto->toArray());

        return $updated;
    }

    public function delete(int $id): bool
    {
        $model = $this->repository->findById($id);
        $result = false;

        DB::transaction(function () use ($id, &$result) {
            $result = $this->repository->delete($id);
        });

        $this->logActivity('deleted', $model, $model->toArray());

        return $result;
    }

    private function logActivity(string $action, Model $model, array $data = []): void
    {
        activity()
            ->causedBy(auth()->user())
            ->performedOn($model)
            ->withProperties($data)
            ->log("{$action} " . class_basename($model));
    }
}
