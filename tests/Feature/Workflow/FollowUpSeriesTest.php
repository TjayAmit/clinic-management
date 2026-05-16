<?php

use App\Enums\ServiceCategory;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Service;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $staffUser = User::factory()->staff()->create();
    $this->actingAs($staffUser);
});

test('follow-up appointment inherits patient dentist service from parent', function () {
    $parent = Appointment::factory()->create([
        'patient_id' => Patient::factory()->create()->id,
        'doctor_id' => Doctor::factory()->create()->id,
        'service_id' => Service::factory()->create()->id,
        'status' => 'completed',
    ]);

    $response = $this->post("/appointments/{$parent->id}/follow-up", [
        'appointment_date' => now()->addMonth()->toDateString(),
        'start_time' => '10:00',
        'end_time' => '11:00',
    ]);
    $response->assertRedirect();

    $followUp = Appointment::where('parent_appointment_id', $parent->id)->first();
    expect($followUp->patient_id)->toBe($parent->patient_id);
    expect($followUp->doctor_id)->toBe($parent->doctor_id);
    expect($followUp->service_id)->toBe($parent->service_id);
});

test('follow-up has parent_appointment_id set', function () {
    $parent = Appointment::factory()->create(['status' => 'completed']);

    $this->post("/appointments/{$parent->id}/follow-up", [
        'appointment_date' => now()->addMonth()->toDateString(),
        'start_time' => '10:00',
        'end_time' => '11:00',
    ]);

    $followUp = Appointment::where('parent_appointment_id', $parent->id)->first();
    expect($followUp->parent_appointment_id)->toBe($parent->id);
});

test('parent can have multiple follow-ups', function () {
    $parent = Appointment::factory()->create(['status' => 'completed']);

    $this->post("/appointments/{$parent->id}/follow-up", [
        'appointment_date' => now()->addMonth()->toDateString(),
        'start_time' => '10:00',
        'end_time' => '11:00',
    ]);

    $this->post("/appointments/{$parent->id}/follow-up", [
        'appointment_date' => now()->addMonths(2)->toDateString(),
        'start_time' => '10:00',
        'end_time' => '11:00',
    ]);

    $parent->refresh();
    expect($parent->followUps()->count())->toBe(2);
});

test('long-term service can generate series', function () {
    $service = Service::factory()->create([
        'category' => ServiceCategory::LongTerm->value,
    ]);

    $parent = Appointment::factory()->create([
        'service_id' => $service->id,
        'status' => 'completed',
    ]);

    // Create multiple follow-ups for a long-term service
    $this->post("/appointments/{$parent->id}/follow-up", [
        'appointment_date' => now()->addMonth()->toDateString(),
        'start_time' => '10:00',
        'end_time' => '11:00',
    ]);

    $this->post("/appointments/{$parent->id}/follow-up", [
        'appointment_date' => now()->addMonths(2)->toDateString(),
        'start_time' => '10:00',
        'end_time' => '11:00',
    ]);

    $this->post("/appointments/{$parent->id}/follow-up", [
        'appointment_date' => now()->addMonths(3)->toDateString(),
        'start_time' => '10:00',
        'end_time' => '11:00',
    ]);

    $parent->refresh();
    expect($parent->followUps()->count())->toBe(3);
});

test('parent relation returns the parent appointment', function () {
    $parent = Appointment::factory()->create(['status' => 'completed']);

    $this->post("/appointments/{$parent->id}/follow-up", [
        'appointment_date' => now()->addMonth()->toDateString(),
        'start_time' => '10:00',
        'end_time' => '11:00',
    ]);

    $followUp = Appointment::where('parent_appointment_id', $parent->id)->first();
    expect($followUp->parent->id)->toBe($parent->id);
});

test('followUps relation returns all children', function () {
    $parent = Appointment::factory()->create(['status' => 'completed']);

    $this->post("/appointments/{$parent->id}/follow-up", [
        'appointment_date' => now()->addMonth()->toDateString(),
        'start_time' => '10:00',
        'end_time' => '11:00',
    ]);

    $this->post("/appointments/{$parent->id}/follow-up", [
        'appointment_date' => now()->addMonths(2)->toDateString(),
        'start_time' => '10:00',
        'end_time' => '11:00',
    ]);

    $parent->refresh();
    expect($parent->followUps)->toHaveCount(2);
});
