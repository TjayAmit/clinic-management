<?php

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Queue;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $staffUser = User::factory()->staff()->create();
    $this->actingAs($staffUser);
});

test('staff can view todays queue', function () {
    Queue::factory()->count(3)->create(['queue_date' => now()->toDateString()]);

    $response = $this->get('/queue');

    $response->assertStatus(200);
});

test('filter queue by date', function () {
    Queue::factory()->create(['queue_date' => '2026-05-14']);
    Queue::factory()->create(['queue_date' => '2026-05-15']);

    $response = $this->get('/queue?date=2026-05-14');

    $response->assertStatus(200);
});

test('filter queue by doctor', function () {
    $doctor1 = Doctor::factory()->create();
    $doctor2 = Doctor::factory()->create();

    $appointment1 = Appointment::factory()->create(['doctor_id' => $doctor1->id]);
    $appointment2 = Appointment::factory()->create(['doctor_id' => $doctor2->id]);

    Queue::factory()->create(['appointment_id' => $appointment1->id, 'queue_date' => now()->toDateString()]);
    Queue::factory()->create(['appointment_id' => $appointment2->id, 'queue_date' => now()->toDateString()]);

    $response = $this->get("/queue?doctor_id={$doctor1->id}");

    $response->assertStatus(200);
});

test('staff can add a patient to queue', function () {
    $appointment = Appointment::factory()->create();

    $response = $this->post('/queue', [
        'appointment_id' => $appointment->id,
    ]);

    $response->assertStatus(302);
    $this->assertDatabaseHas('queues', [
        'appointment_id' => $appointment->id,
        'status' => 'waiting',
    ]);
});

test('auto-assigns position as next in sequence', function () {
    $appointment1 = Appointment::factory()->create();
    $appointment2 = Appointment::factory()->create();

    $this->post('/queue', ['appointment_id' => $appointment1->id]);
    $this->post('/queue', ['appointment_id' => $appointment2->id]);

    $queue1 = Queue::where('appointment_id', $appointment1->id)->first();
    $queue2 = Queue::where('appointment_id', $appointment2->id)->first();

    expect($queue1->position)->toBe(1);
    expect($queue2->position)->toBe(2);
});

test('staff can call next patient', function () {
    $queue = Queue::factory()->create(['status' => 'waiting']);

    $response = $this->from('/queue')->patch("/queue/{$queue->id}/call");

    $response->assertRedirect('/queue');
    $this->assertDatabaseHas('queues', [
        'id' => $queue->id,
        'status' => 'in_progress',
    ]);
});

test('staff can complete queue entry', function () {
    $queue = Queue::factory()->create(['status' => 'in_progress']);

    $response = $this->from('/queue')->patch("/queue/{$queue->id}/complete");

    $response->assertRedirect('/queue');
    $this->assertDatabaseHas('queues', [
        'id' => $queue->id,
        'status' => 'completed',
    ]);
});

test('staff can mark no-show', function () {
    $queue = Queue::factory()->create(['status' => 'waiting']);

    $response = $this->from('/queue')->patch("/queue/{$queue->id}/no-show");

    $response->assertRedirect('/queue');
    $this->assertDatabaseHas('queues', [
        'id' => $queue->id,
        'status' => 'no_show',
    ]);
});

test('staff can remove patient from queue', function () {
    $queue = Queue::factory()->create();

    $response = $this->from('/queue')->delete("/queue/{$queue->id}");

    $response->assertRedirect('/queue');
    $this->assertDatabaseMissing('queues', ['id' => $queue->id]);
});

test('cannot add appointment already in queue', function () {
    $appointment = Appointment::factory()->create();
    Queue::factory()->create(['appointment_id' => $appointment->id]);

    $response = $this->post('/queue', ['appointment_id' => $appointment->id]);

    $response->assertSessionHasErrors(['appointment_id']);
});
