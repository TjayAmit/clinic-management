<?php

namespace App\Repositories\Eloquent;

use App\Models\Queue;
use App\Repositories\QueueRepository;

class EloquentQueueRepository implements QueueRepository
{
    public function getByDate(string $date): iterable
    {
        return Queue::with(['appointment.patient', 'appointment.dentist.user', 'appointment.service'])
            ->whereDate('queue_date', $date)
            ->orderBy('position')
            ->get();
    }

    public function getByDateAndDoctor(string $date, int $doctorId): iterable
    {
        return Queue::with(['appointment.patient', 'appointment.service'])
            ->whereDate('queue_date', $date)
            ->whereHas('appointment', fn ($q) => $q->where('doctor_id', $doctorId))
            ->orderBy('position')
            ->get();
    }

    public function findById(int $id): ?Queue
    {
        return Queue::find($id);
    }

    public function findByAppointmentAndDate(int $appointmentId, string $date): ?Queue
    {
        return Queue::where('appointment_id', $appointmentId)
            ->whereDate('queue_date', $date)
            ->first();
    }

    public function getNextPosition(string $date): int
    {
        $max = Queue::whereDate('queue_date', $date)->max('position');

        return ($max ?? 0) + 1;
    }

    public function create(array $data): Queue
    {
        return Queue::create($data);
    }

    public function update(int $id, array $data): Queue
    {
        $queue = $this->findById($id);
        $queue->update($data);

        return $queue;
    }

    public function reorder(string $date, array $orderedIds): void
    {
        foreach ($orderedIds as $position => $id) {
            Queue::where('id', $id)
                ->whereDate('queue_date', $date)
                ->update(['position' => $position + 1]);
        }
    }

    public function delete(int $id): bool
    {
        $queue = $this->findById($id);

        return $queue->delete();
    }
}
