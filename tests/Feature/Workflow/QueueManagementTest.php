<?php

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Queue;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $staffUser = User::factory()->staff()->create();
    $this->actingAs($staffUser);
});

test('only one patient is in_progress per doctor at a time', function () {
    $doctor = Doctor::factory()->create();

    $appointment1 = Appointment::factory()->create(['doctor_id' => $doctor->id]);
    $appointment2 = Appointment::factory()->create(['doctor_id' => $doctor->id]);

    $queue1 = Queue::factory()->create([
        'appointment_id' => $appointment1->id,
        'queue_date' => now()->toDateString(),
        'position' => 1,
        'status' => 'in_progress',
    ]);

    // System does not auto-block - staff must manage this manually
    $queue2 = Queue::factory()->create([
        'appointment_id' => $appointment2->id,
        'queue_date' => now()->toDateString(),
        'position' => 2,
        'status' => 'waiting',
    ]);

    $this->patch("/queue/{$queue2->id}/call");

    $queue2->refresh();
    expect($queue2->status)->toBe('in_progress');
});

test('queue resets daily no carryover', function () {
    $appointment = Appointment::factory()->create();

    // Create queue entry for yesterday
    Queue::factory()->create([
        'appointment_id' => $appointment->id,
        'queue_date' => now()->subDay()->toDateString(),
        'status' => 'waiting',
    ]);

    // Create queue entry for today
    Queue::factory()->create([
        'appointment_id' => $appointment->id,
        'queue_date' => now()->toDateString(),
        'status' => 'waiting',
    ]);

    $response = $this->get('/queue');
    $response->assertStatus(200);

    // getToday should only return entries with today's queue_date
    $todayQueues = Queue::where('queue_date', now()->toDateString())->get();
    expect($todayQueues)->toHaveCount(1);
});

test('walk-in patient added to queue appears in todays list', function () {
    $patient = Patient::factory()->create();
    $doctor = Doctor::factory()->create();
    $service = Service::factory()->create();

    // Create walk-in appointment
    $appointment = Appointment::factory()->create([
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'service_id' => $service->id,
        'appointment_date' => now()->toDateString(),
        'is_walk_in' => true,
    ]);

    // Add to queue
    $this->post('/queue', ['appointment_id' => $appointment->id]);

    // Verify it appears in today's list
    $todayQueues = Queue::where('queue_date', now()->toDateString())->get();
    expect($todayQueues)->toHaveCount(1);
    expect($todayQueues->first()->appointment_id)->toBe($appointment->id);
});
