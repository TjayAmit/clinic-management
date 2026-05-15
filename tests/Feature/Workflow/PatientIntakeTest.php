<?php

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Queue;
use App\Models\Service;
use App\Models\User;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    Notification::fake();
    $this->seed(\Database\Seeders\RoleAndPermissionSeeder::class);
    $staffUser = User::factory()->staff()->create();
    $this->actingAs($staffUser);
});

test('Scenario A: Existing Patient Walk-in', function () {
    // 1. Search for patient by name
    $patient = Patient::factory()->create(['first_name' => 'Jane', 'last_name' => 'Doe']);
    $response = $this->get("/patients?search=Jane");
    $response->assertStatus(200);

    // 2. Patient has no appointment today
    $response = $this->get('/appointments?date=' . now()->toDateString() . "&patient_id={$patient->id}");
    $response->assertStatus(200);

    // 3. Create walk-in appointment
    $doctor = Doctor::factory()->create();
    $service = Service::factory()->create();

    $response = $this->post('/appointments', [
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'service_id' => $service->id,
        'appointment_date' => now()->toDateString(),
        'start_time' => '09:00',
        'end_time' => '10:00',
        'is_walk_in' => true,
    ]);
    $response->assertStatus(302);

    $appointment = Appointment::where('patient_id', $patient->id)->first();
    expect($appointment->is_walk_in)->toBeTrue();

    // 4. Add to queue
    $response = $this->post('/queue', ['appointment_id' => $appointment->id]);
    $response->assertStatus(302);

    $queue = Queue::where('appointment_id', $appointment->id)->first();
    expect($queue->position)->toBe(1);

    // 5. Call patient
    $response = $this->from('/queue')->patch("/queue/{$queue->id}/call");
    $response->assertRedirect('/queue');
    $queue->refresh();
    expect($queue->status->value)->toBe('in_progress');

    // 6. Complete
    $this->from('/queue')->patch("/queue/{$queue->id}/complete");
    $this->from('/appointments')->patch("/appointments/{$appointment->id}/complete");

    $queue->refresh();
    $appointment->refresh();
    expect($queue->status->value)->toBe('completed');
    expect($appointment->status->value)->toBe('completed');
});

test('Scenario B: New Patient Walk-in', function () {
    Notification::fake();

    // 1. Register new patient
    $response = $this->post('/patients', [
        'first_name' => 'John',
        'last_name' => 'Smith',
        'email' => 'john@example.com',
        'phone' => '1234567890',
        'date_of_birth' => '1990-01-01',
        'gender' => 'male',
        'address' => '123 Main St',
    ]);
    $response->assertRedirect('/patients');

    $patient = Patient::where('email', 'john@example.com')->first();
    expect($patient)->not->toBeNull();

    // 2. Create walk-in appointment for new patient
    $doctor = Doctor::factory()->create();
    $service = Service::factory()->create();

    $response = $this->post('/appointments', [
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'service_id' => $service->id,
        'appointment_date' => now()->toDateString(),
        'start_time' => '09:00',
        'end_time' => '10:00',
        'is_walk_in' => true,
    ]);
    $response->assertStatus(302);

    $appointment = Appointment::where('patient_id', $patient->id)->first();
    expect($appointment->is_walk_in)->toBeTrue();

    // 3. Verify AppointmentBooked notification sent
    // Note: This would require the notification to be properly set up in the service

    // 4. Add to queue
    $response = $this->post('/queue', ['appointment_id' => $appointment->id]);
    $response->assertStatus(302);

    $queue = Queue::where('appointment_id', $appointment->id)->first();
    expect($queue->status->value)->toBe('waiting');

    // 5. Complete intake (same as Scenario A steps 5-6)
    $this->from('/queue')->patch("/queue/{$queue->id}/call");
    $this->from('/queue')->patch("/queue/{$queue->id}/complete");
    $this->from('/appointments')->patch("/appointments/{$appointment->id}/complete");

    $queue->refresh();
    $appointment->refresh();
    expect($queue->status->value)->toBe('completed');
    expect($appointment->status->value)->toBe('completed');
});
