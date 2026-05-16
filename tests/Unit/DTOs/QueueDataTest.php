<?php

use App\DTOs\QueueData;
use Illuminate\Http\Request;

test('fromRequest maps appointment_id queue_date position status', function () {
    $request = Request::create('/', 'POST', [
        'appointment_id' => 1,
        'queue_date' => '2026-05-14',
        'position' => 1,
        'status' => 'waiting',
    ]);

    $data = QueueData::fromRequest($request);
    $array = $data->toArray();

    expect($array)->toHaveKeys(['appointment_id', 'queue_date', 'position', 'status']);
    expect($array['appointment_id'])->toBe(1);
    expect($array['queue_date'])->toBe('2026-05-14');
    expect($array['position'])->toBe(1);
    expect($array['status'])->toBe('waiting');
});

test('missing queue_date defaults to today', function () {
    $request = Request::create('/', 'POST', [
        'appointment_id' => 1,
    ]);

    $data = QueueData::fromRequest($request);
    $array = $data->toArray();

    expect($array)->not->toHaveKey('queue_date');
});

test('queue_date can be explicitly set', function () {
    $request = Request::create('/', 'POST', [
        'appointment_id' => 1,
        'queue_date' => '2026-05-14',
    ]);

    $data = QueueData::fromRequest($request);
    $array = $data->toArray();

    expect($array['queue_date'])->toBe('2026-05-14');
});

test('status defaults to waiting', function () {
    $request = Request::create('/', 'POST', [
        'appointment_id' => 1,
    ]);

    $data = QueueData::fromRequest($request);
    $array = $data->toArray();

    expect($array['status'])->toBe('waiting');
});
