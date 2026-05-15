<?php

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Service;
use App\Models\User;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    $this->seed(\Database\Seeders\RoleAndPermissionSeeder::class);
    $staffUser = User::factory()->staff()->create();
    $this->actingAs($staffUser);
});

test('confirm a pending appointment', function () {
    Notification::fake();

    $appointment = Appointment::factory()->create(['status' => 'pending']);

    $response = $this->from('/appointments')->patch("/appointments/{$appointment->id}/confirm");
    $response->assertRedirect('/appointments');

    $appointment->refresh();
    expect($appointment->status->value)->toBe('confirmed');
});

test('move confirmed to in-queue', function () {
    $appointment = Appointment::factory()->create(['status' => 'confirmed']);

    $response = $this->from('/appointments')->patch("/appointments/{$appointment->id}/in-queue");
    $response->assertRedirect('/appointments');

    $appointment->refresh();
    expect($appointment->status->value)->toBe('in_queue');
});

test('mark in-progress', function () {
    $appointment = Appointment::factory()->create(['status' => 'in_queue']);

    $response = $this->from('/appointments')->patch("/appointments/{$appointment->id}/in-progress");
    $response->assertRedirect('/appointments');

    $appointment->refresh();
    expect($appointment->status->value)->toBe('in_progress');
});

test('complete an in-progress appointment', function () {
    Notification::fake();

    $appointment = Appointment::factory()->create(['status' => 'in_progress']);

    $response = $this->from('/appointments')->patch("/appointments/{$appointment->id}/complete");
    $response->assertRedirect('/appointments');

    $appointment->refresh();
    expect($appointment->status->value)->toBe('completed');
});

test('cancel an appointment', function () {
    Notification::fake();

    $appointment = Appointment::factory()->create(['status' => 'pending']);

    $response = $this->from('/appointments')->patch("/appointments/{$appointment->id}/cancel");
    $response->assertRedirect('/appointments');

    $appointment->refresh();
    expect($appointment->status->value)->toBe('cancelled');
});

test('mark no-show', function () {
    $appointment = Appointment::factory()->create(['status' => 'pending']);

    $response = $this->from('/appointments')->patch("/appointments/{$appointment->id}/no-show");
    $response->assertRedirect('/appointments');

    $appointment->refresh();
    expect($appointment->status->value)->toBe('no_show');
});

test('mark needs follow-up', function () {
    $appointment = Appointment::factory()->create(['status' => 'in_progress']);

    $response = $this->from('/appointments')->patch("/appointments/{$appointment->id}/needs-follow-up");
    $response->assertRedirect('/appointments');

    $appointment->refresh();
    expect($appointment->status->value)->toBe('needs_follow_up');
});

test('create follow-up from parent', function () {
    $parent = Appointment::factory()->create([
        'status' => 'completed',
        'patient_id' => Patient::factory()->create()->id,
        'doctor_id' => Doctor::factory()->create()->id,
        'service_id' => Service::factory()->create()->id,
    ]);

    $response = $this->post("/appointments/{$parent->id}/follow-up", [
        'appointment_date' => now()->addMonth()->toDateString(),
        'start_time' => '10:00',
        'end_time' => '11:00',
    ]);
    $response->assertRedirect();

    $followUp = Appointment::where('parent_appointment_id', $parent->id)->first();
    expect($followUp)->not->toBeNull();
    expect($followUp->patient_id)->toBe($parent->patient_id);
    expect($followUp->doctor_id)->toBe($parent->doctor_id);
    expect($followUp->service_id)->toBe($parent->service_id);
});
