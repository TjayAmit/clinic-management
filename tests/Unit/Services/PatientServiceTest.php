<?php

use App\Models\Patient;
use App\Repositories\PatientRepository;
use App\Services\PatientService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;

uses(RefreshDatabase::class);

test('createFromRequest calls repository create', function () {
    $repository = mock(PatientRepository::class);
    $service = new PatientService($repository);
    $request = Request::create('/', 'POST', [
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'john@example.com',
    ]);

    $patient = Patient::factory()->make();

    $repository->shouldReceive('create')->once()->andReturn($patient);

    $service->createFromRequest($request);
});

test('search delegates term to repository', function () {
    $repository = mock(PatientRepository::class);
    $service = new PatientService($repository);

    $term = 'John';

    $repository->shouldReceive('search')->once()->with($term)->andReturn([]);

    $service->search($term);
});

test('findWithHistory loads dental history eager load', function () {
    $repository = mock(PatientRepository::class);
    $service = new PatientService($repository);

    $patient = Patient::factory()->make();

    $repository->shouldReceive('findWithHistory')->once()->with(1)->andReturn($patient);

    $service->findWithHistory(1);
});

test('delete soft-deletes via repository', function () {
    $repository = mock(PatientRepository::class);
    $service = new PatientService($repository);

    $patient = Patient::factory()->make();

    $repository->shouldReceive('findById')->once()->with(1)->andReturn($patient);
    $repository->shouldReceive('delete')->once()->with(1)->andReturn(true);

    $result = $service->delete(1);

    expect($result)->toBeTrue();
});
