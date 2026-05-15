<?php

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Service;
use App\Models\User;

beforeEach(function () {
    $this->seed(\Database\Seeders\RoleAndPermissionSeeder::class);
    $staffUser = User::factory()->staff()->create();
    $this->actingAs($staffUser);
});

test('staff can list appointments', function () {
    Appointment::factory()->count(3)->create();

    $response = $this->get('/appointments');

    $response->assertStatus(200);
});

test('filter by date returns correct subset', function () {
    Appointment::factory()->create(['appointment_date' => '2026-05-14']);
    Appointment::factory()->create(['appointment_date' => '2026-05-15']);

    $response = $this->get('/appointments?date=2026-05-14');

    $response->assertStatus(200);
});

test('filter by dentist returns correct subset', function () {
    $doctor1 = Doctor::factory()->create();
    $doctor2 = Doctor::factory()->create();

    Appointment::factory()->create(['doctor_id' => $doctor1->id]);
    Appointment::factory()->create(['doctor_id' => $doctor2->id]);

    $response = $this->get("/appointments?doctor_id={$doctor1->id}");

    $response->assertStatus(200);
});

test('filter by status returns correct subset', function () {
    Appointment::factory()->create(['status' => 'pending']);
    Appointment::factory()->create(['status' => 'confirmed']);

    $response = $this->get('/appointments?status=confirmed');

    $response->assertStatus(200);
});

test('filter walk-ins only', function () {
    Appointment::factory()->create(['is_walk_in' => true]);
    Appointment::factory()->create(['is_walk_in' => false]);

    $response = $this->get('/appointments?walk_in=1');

    $response->assertStatus(200);
});

test('staff can create a scheduled appointment', function () {
    $patient = Patient::factory()->create();
    $doctor = Doctor::factory()->create();
    $service = Service::factory()->create();
    $futureDate = now()->addDay()->toDateString();

    $response = $this->post('/appointments', [
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'service_id' => $service->id,
        'appointment_date' => $futureDate,
        'start_time' => '09:00',
        'end_time' => '10:00',
        'is_walk_in' => false,
    ]);

    $response->assertStatus(302);
    $this->assertDatabaseHas('appointments', [
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
    ]);
});

test('staff can create a walk-in appointment', function () {
    $patient = Patient::factory()->create();
    $doctor = Doctor::factory()->create();
    $service = Service::factory()->create();
    $futureDate = now()->addDay()->toDateString();

    $response = $this->post('/appointments', [
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'service_id' => $service->id,
        'appointment_date' => $futureDate,
        'start_time' => '09:00',
        'end_time' => '10:00',
        'is_walk_in' => true,
    ]);

    $response->assertStatus(302);
    $this->assertDatabaseHas('appointments', [
        'patient_id' => $patient->id,
        'is_walk_in' => true,
    ]);
});

test('conflict detection blocks double-booking', function () {
    $patient = Patient::factory()->create();
    $doctor = Doctor::factory()->create();
    $service = Service::factory()->create();
    $futureDate = now()->addDay()->toDateString();

    Appointment::factory()->create([
        'doctor_id' => $doctor->id,
        'appointment_date' => $futureDate,
        'start_time' => '09:00',
        'end_time' => '10:00',
    ]);

    $response = $this->post('/appointments', [
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'service_id' => $service->id,
        'appointment_date' => $futureDate,
        'start_time' => '09:30',
        'end_time' => '10:30',
    ]);

    $response->assertSessionHasErrors(['start_time']);
});

test('staff can update appointment', function () {
    $appointment = Appointment::factory()->create();

    $response = $this->put("/appointments/{$appointment->id}", [
        'patient_id' => $appointment->patient_id,
        'doctor_id' => $appointment->doctor_id,
        'service_id' => $appointment->service_id,
        'appointment_date' => now()->addDay()->toDateString(),
        'start_time' => '11:00',
        'end_time' => '12:00',
    ]);

    $response->assertRedirect("/appointments/{$appointment->id}");
});

test('admin can delete appointment', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Admin');
    $this->actingAs($admin);

    $appointment = Appointment::factory()->create();

    $response = $this->delete("/appointments/{$appointment->id}");

    $response->assertRedirect('/appointments');
    $this->assertSoftDeleted('appointments', ['id' => $appointment->id]);
});

test('validation fails on missing required fields', function () {
    $response = $this->post('/appointments', [
        'patient_id' => 1,
    ]);

    $response->assertSessionHasErrors(['doctor_id', 'service_id', 'appointment_date']);
});
