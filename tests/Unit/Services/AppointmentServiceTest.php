<?php

use App\Models\Appointment;
use App\Notifications\AppointmentBooked;
use App\Notifications\AppointmentCancelled;
use App\Notifications\AppointmentCompleted;
use App\Notifications\AppointmentConfirmed;
use App\Repositories\AppointmentRepository;
use App\Services\AppointmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;

uses(RefreshDatabase::class);

test('createFromRequest calls repository create once', function () {
    Notification::fake();

    $repository = mock(AppointmentRepository::class);
    $service = new AppointmentService($repository);
    $request = Request::create('/', 'POST', [
        'patient_id' => 1,
        'doctor_id' => 1,
        'service_id' => 1,
        'appointment_date' => '2026-05-14',
        'start_time' => '09:00',
        'end_time' => '10:00',
    ]);

    $appointment = Appointment::factory()->make();
    $repository->shouldReceive('create')->once()->andReturn($appointment);

    $service->createFromRequest($request);
});

test('createFromRequest sends AppointmentBooked to patient and doctor', function () {
    Notification::fake();

    $repository = mock(AppointmentRepository::class);
    $service = new AppointmentService($repository);

    $request = Request::create('/', 'POST', [
        'patient_id' => 1,
        'doctor_id' => 1,
        'service_id' => 1,
        'appointment_date' => '2026-05-14',
        'start_time' => '09:00',
        'end_time' => '10:00',
    ]);

    $appointment = Appointment::factory()
        ->withPatient()
        ->withDoctor()
        ->make();

    $repository->shouldReceive('create')->once()->andReturn($appointment);

    $service->createFromRequest($request);

    Notification::assertSentTo($appointment->patient, AppointmentBooked::class);
    Notification::assertSentTo($appointment->doctor->user, AppointmentBooked::class);
});

test('confirm calls updateStatus and sends AppointmentConfirmed', function () {
    Notification::fake();

    $repository = mock(AppointmentRepository::class);
    $service = new AppointmentService($repository);

    $appointment = Appointment::factory()
        ->withPatient()
        ->withDoctor()
        ->make(['status' => 'pending']);

    $repository->shouldReceive('updateStatus')->once()->with(1, 'confirmed')->andReturn($appointment);

    $service->confirm(1);

    Notification::assertSentTo($appointment->doctor->user, AppointmentConfirmed::class);
    Notification::assertSentTo($appointment->patient, AppointmentConfirmed::class);
});

test('cancel sends AppointmentCancelled to patient and doctor', function () {
    Notification::fake();

    $repository = mock(AppointmentRepository::class);
    $service = new AppointmentService($repository);

    $appointment = Appointment::factory()
        ->withPatient()
        ->withDoctor()
        ->make(['status' => 'pending']);

    $repository->shouldReceive('updateStatus')->once()->with(1, 'cancelled')->andReturn($appointment);

    $service->cancel(1);

    Notification::assertSentTo($appointment->patient, AppointmentCancelled::class);
    Notification::assertSentTo($appointment->doctor->user, AppointmentCancelled::class);
});

test('complete sends AppointmentCompleted to patient', function () {
    Notification::fake();

    $repository = mock(AppointmentRepository::class);
    $service = new AppointmentService($repository);

    $appointment = Appointment::factory()
        ->withPatient()
        ->withDoctor()
        ->make(['status' => 'in_progress']);

    $repository->shouldReceive('updateStatus')->once()->with(1, 'completed')->andReturn($appointment);

    $service->complete(1);

    Notification::assertSentTo($appointment->patient, AppointmentCompleted::class);
});

test('createFollowUp sets parent_appointment_id from parent', function () {
    $repository = mock(AppointmentRepository::class);
    $service = new AppointmentService($repository);

    $parent = Appointment::factory()->make([
        'id' => 5,
        'patient_id' => 1,
        'doctor_id' => 1,
        'service_id' => 1,
    ]);

    $request = Request::create('/', 'POST', [
        'appointment_date' => '2026-05-14',
        'start_time' => '09:00',
        'end_time' => '10:00',
    ]);

    $followUp = Appointment::factory()->make(['parent_appointment_id' => 5]);

    $repository->shouldReceive('create')
        ->once()
        ->with(Mockery::on(function ($data) {
            return $data['parent_appointment_id'] === 5 &&
                   $data['patient_id'] === 1 &&
                   $data['doctor_id'] === 1 &&
                   $data['service_id'] === 1;
        }))
        ->andReturn($followUp);

    $result = $service->createFollowUp($parent, $request);

    expect($result->parent_appointment_id)->toBe(5);
});

test('checkConflict delegates to repository', function () {
    $repository = mock(AppointmentRepository::class);
    $service = new AppointmentService($repository);

    $repository->shouldReceive('checkConflict')
        ->once()
        ->with(1, '2026-05-14', '09:00', '10:00', null)
        ->andReturn(true);

    $result = $service->checkConflict(1, '2026-05-14', '09:00', '10:00');

    expect($result)->toBeTrue();
});
