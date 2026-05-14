<?php

use App\Enums\QueueStatus;
use App\Models\Queue;
use App\Repositories\QueueRepository;
use App\Services\QueueService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;

uses(RefreshDatabase::class);

test('addToQueue calculates position as next available', function () {
    $repository = mock(QueueRepository::class);
    $service = new QueueService($repository);
    $request = Request::create('/', 'POST', [
        'appointment_id' => 1,
        'queue_date' => '2026-05-14',
    ]);

    $queue = Queue::factory()->make(['position' => 1]);

    $repository->shouldReceive('getNextPosition')->once()->with('2026-05-14')->andReturn(1);
    $repository->shouldReceive('create')->once()->andReturn($queue);

    $service->addToQueue($request);
});

test('addToQueue sets initial status to Waiting', function () {
    $repository = mock(QueueRepository::class);
    $service = new QueueService($repository);

    $request = Request::create('/', 'POST', [
        'appointment_id' => 1,
        'queue_date' => '2026-05-14',
    ]);

    $queue = Queue::factory()->make(['status' => QueueStatus::Waiting->value]);

    $repository->shouldReceive('getNextPosition')->once()->andReturn(1);
    $repository->shouldReceive('create')
        ->once()
        ->with(\Mockery::on(function ($data) {
            return $data['status'] === QueueStatus::Waiting->value;
        }))
        ->andReturn($queue);

    $service->addToQueue($request);
});

test('callNext sets status to in_progress and stamps called_at', function () {
    $repository = mock(QueueRepository::class);
    $service = new QueueService($repository);

    $queue = Queue::factory()->make(['id' => 1]);

    $repository->shouldReceive('update')
        ->once()
        ->with(1, \Mockery::on(function ($data) {
            return $data['status'] === QueueStatus::InProgress->value &&
                   isset($data['called_at']);
        }))
        ->andReturn($queue);

    $service->callNext(1);
});

test('markCompleted sets status to completed and stamps completed_at', function () {
    $repository = mock(QueueRepository::class);
    $service = new QueueService($repository);

    $queue = Queue::factory()->make(['id' => 1]);

    $repository->shouldReceive('update')
        ->once()
        ->with(1, \Mockery::on(function ($data) {
            return $data['status'] === QueueStatus::Completed->value &&
                   isset($data['completed_at']);
        }))
        ->andReturn($queue);

    $service->markCompleted(1);
});

test('markNoShow sets status to no_show without timestamps', function () {
    $repository = mock(QueueRepository::class);
    $service = new QueueService($repository);

    $queue = Queue::factory()->make(['id' => 1]);

    $repository->shouldReceive('update')
        ->once()
        ->with(1, \Mockery::on(function ($data) {
            return $data['status'] === QueueStatus::NoShow->value &&
                   !isset($data['called_at']) &&
                   !isset($data['completed_at']);
        }))
        ->andReturn($queue);

    $service->markNoShow(1);
});

test('reorder wraps in transaction', function () {
    $repository = mock(QueueRepository::class);
    $service = new QueueService($repository);

    $orderedIds = [3, 1, 2];

    $repository->shouldReceive('reorder')
        ->once()
        ->with('2026-05-14', $orderedIds);

    $service->reorder('2026-05-14', $orderedIds);
});
