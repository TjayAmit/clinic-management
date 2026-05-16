<?php

use App\DTOs\AppointmentData;
use Illuminate\Http\Request;

test('fromRequest maps all required fields', function () {
    $request = Request::create('/', 'POST', [
        'patient_id' => 1,
        'doctor_id' => 1,
        'service_id' => 1,
        'appointment_date' => '2026-05-14',
        'start_time' => '09:00',
        'end_time' => '10:00',
    ]);

    $data = AppointmentData::fromRequest($request);
    $array = $data->toArray();

    expect($array)->toHaveKeys(['patient_id', 'doctor_id', 'service_id', 'appointment_date', 'start_time', 'end_time']);
    expect($array['patient_id'])->toBe(1);
    expect($array['doctor_id'])->toBe(1);
    expect($array['service_id'])->toBe(1);
});

test('is_walk_in defaults to false when absent', function () {
    $request = Request::create('/', 'POST', [
        'patient_id' => 1,
        'doctor_id' => 1,
        'service_id' => 1,
    ]);

    $data = AppointmentData::fromRequest($request);
    $array = $data->toArray();

    expect($array['is_walk_in'])->toBeFalse();
});

test('is_walk_in can be set to true', function () {
    $request = Request::create('/', 'POST', [
        'patient_id' => 1,
        'doctor_id' => 1,
        'service_id' => 1,
        'is_walk_in' => true,
    ]);

    $data = AppointmentData::fromRequest($request);
    $array = $data->toArray();

    expect($array['is_walk_in'])->toBeTrue();
});

test('teeth_involved is cast to array', function () {
    $request = Request::create('/', 'POST', [
        'patient_id' => 1,
        'doctor_id' => 1,
        'service_id' => 1,
        'teeth_involved' => [1, 2, 3],
    ]);

    $data = AppointmentData::fromRequest($request);
    $array = $data->toArray();

    expect($array['teeth_involved'])->toBeArray();
    expect($array['teeth_involved'])->toBe([1, 2, 3]);
});

test('parent_appointment_id is nullable', function () {
    $request = Request::create('/', 'POST', [
        'patient_id' => 1,
        'doctor_id' => 1,
        'service_id' => 1,
    ]);

    $data = AppointmentData::fromRequest($request);
    $array = $data->toArray();

    expect($array)->not->toHaveKey('parent_appointment_id');
});

test('parent_appointment_id can be set', function () {
    $request = Request::create('/', 'POST', [
        'patient_id' => 1,
        'doctor_id' => 1,
        'service_id' => 1,
        'parent_appointment_id' => 5,
    ]);

    $data = AppointmentData::fromRequest($request);
    $array = $data->toArray();

    expect($array['parent_appointment_id'])->toBe(5);
});

test('series_position = 1 is not dropped by toArray', function () {
    $request = Request::create('/', 'POST', [
        'patient_id' => 1,
        'doctor_id' => 1,
        'service_id' => 1,
        'series_total' => 3,
        'series_position' => 1,
    ]);

    $data = AppointmentData::fromRequest($request);
    $array = $data->toArray();

    expect($array['series_total'])->toBe(3);
    expect($array['series_position'])->toBe(1);
});

test('series_position = 0 is preserved when explicitly set', function () {
    $request = Request::create('/', 'POST', [
        'patient_id' => 1,
        'doctor_id' => 1,
        'service_id' => 1,
        'series_total' => 0,
        'series_position' => 0,
    ]);

    $data = AppointmentData::fromRequest($request);
    $array = $data->toArray();

    expect($array['series_total'])->toBe(0);
    expect($array['series_position'])->toBe(0);
});
