<?php

use App\DTOs\PatientVisitData;
use Illuminate\Http\Request;

test('fromRequest maps all required fields', function () {
    $request = Request::create('/', 'POST', [
        'patient_id' => 1,
        'doctor_id' => 1,
        'visited_at' => '2026-05-14 09:00:00',
    ]);

    $data = PatientVisitData::fromRequest($request);
    $array = $data->toArray();

    expect($array)->toHaveKeys(['patient_id', 'doctor_id', 'visited_at']);
    expect($array['patient_id'])->toBe(1);
    expect($array['doctor_id'])->toBe(1);
});

test('heart_rate = 0 is preserved when explicitly set', function () {
    $request = Request::create('/', 'POST', [
        'patient_id' => 1,
        'doctor_id' => 1,
        'visited_at' => '2026-05-14 09:00:00',
        'heart_rate' => 0,
    ]);

    $data = PatientVisitData::fromRequest($request);
    $array = $data->toArray();

    expect($array['heart_rate'])->toBe(0);
});

test('temperature = 0.0 is preserved when explicitly set', function () {
    $request = Request::create('/', 'POST', [
        'patient_id' => 1,
        'doctor_id' => 1,
        'visited_at' => '2026-05-14 09:00:00',
        'temperature' => 0.0,
    ]);

    $data = PatientVisitData::fromRequest($request);
    $array = $data->toArray();

    expect($array['temperature'])->toBe(0.0);
});

test('weight = 0.0 is preserved when explicitly set', function () {
    $request = Request::create('/', 'POST', [
        'patient_id' => 1,
        'doctor_id' => 1,
        'visited_at' => '2026-05-14 09:00:00',
        'weight' => 0.0,
    ]);

    $data = PatientVisitData::fromRequest($request);
    $array = $data->toArray();

    expect($array['weight'])->toBe(0.0);
});

test('nullable fields are omitted when null', function () {
    $request = Request::create('/', 'POST', [
        'patient_id' => 1,
        'doctor_id' => 1,
        'visited_at' => '2026-05-14 09:00:00',
    ]);

    $data = PatientVisitData::fromRequest($request);
    $array = $data->toArray();

    expect($array)->not->toHaveKey('heart_rate');
    expect($array)->not->toHaveKey('temperature');
    expect($array)->not->toHaveKey('weight');
    expect($array)->not->toHaveKey('blood_pressure');
});
