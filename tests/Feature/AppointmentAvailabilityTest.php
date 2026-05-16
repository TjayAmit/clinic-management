<?php

use App\Enums\AppointmentStatus;
use App\Enums\DayOfWeek;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Support\Carbon;

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $staff = User::factory()->staff()->create();
    $this->actingAs($staff);
});

test('returns availability for today when no date given', function () {
    Doctor::factory()->create();

    $response = $this->getJson('/appointments/availability');

    $response->assertOk()
        ->assertJsonStructure([
            'date', 'date_label', 'is_full',
            'summary' => ['total_minutes', 'booked_minutes', 'free_minutes'],
            'doctors',
        ])
        ->assertJsonPath('date', today()->toDateString());
});

test('returns empty doctors array and is_full true when no active doctors', function () {
    Doctor::factory()->inactive()->create();

    $response = $this->getJson('/appointments/availability?date=2026-06-02');

    $response->assertOk()
        ->assertJsonPath('is_full', true)
        ->assertJsonPath('doctors', []);
});

test('doctor with no schedules configured is treated as working today', function () {
    $doctor = Doctor::factory()->create();
    // No DoctorSchedule rows created — should be working_today = true

    $response = $this->getJson('/appointments/availability?date=2026-06-02');

    $response->assertOk();
    $doctors = $response->json('doctors');
    expect($doctors)->toHaveCount(1)
        ->and($doctors[0]['working_today'])->toBeTrue()
        ->and($doctors[0]['is_full'])->toBeFalse();
});

test('doctor with schedule on that day is working today', function () {
    $carbon = Carbon::parse('2026-06-05'); // Friday
    $dayEnum = DayOfWeek::Friday;

    $doctor = Doctor::factory()->create();
    DoctorSchedule::factory()->create([
        'doctor_id' => $doctor->id,
        'day_of_week' => $dayEnum,
        'start_time' => '08:00',
        'end_time' => '17:00',
        'is_available' => true,
    ]);

    $response = $this->getJson('/appointments/availability?date=2026-06-05');

    $response->assertOk();
    $doctors = $response->json('doctors');
    expect($doctors[0]['working_today'])->toBeTrue()
        ->and($doctors[0]['schedule']['start'])->toBe('08:00')
        ->and($doctors[0]['schedule']['end'])->toBe('17:00');
});

test('doctor with schedule for different day is not working today', function () {
    $doctor = Doctor::factory()->create();
    // Give the doctor a schedule for Monday only; we will query a Friday
    DoctorSchedule::factory()->create([
        'doctor_id' => $doctor->id,
        'day_of_week' => DayOfWeek::Monday,
        'start_time' => '08:00',
        'end_time' => '17:00',
        'is_available' => true,
    ]);

    // 2026-06-05 is a Friday
    $response = $this->getJson('/appointments/availability?date=2026-06-05');

    $response->assertOk();
    $doctors = $response->json('doctors');
    expect($doctors[0]['working_today'])->toBeFalse()
        ->and($doctors[0]['is_full'])->toBeTrue();
});

test('cancelled and no-show appointments are excluded from booked minutes', function () {
    $doctor = Doctor::factory()->create();
    DoctorSchedule::factory()->create([
        'doctor_id' => $doctor->id,
        'day_of_week' => DayOfWeek::Friday,
        'start_time' => '08:00',
        'end_time' => '17:00',
        'is_available' => true,
    ]);

    // Cancelled appointment — should be excluded
    Appointment::factory()->create([
        'doctor_id' => $doctor->id,
        'appointment_date' => '2026-06-05',
        'start_time' => '09:00',
        'end_time' => '10:00',
        'status' => AppointmentStatus::Cancelled,
    ]);

    // No-show — should be excluded
    Appointment::factory()->create([
        'doctor_id' => $doctor->id,
        'appointment_date' => '2026-06-05',
        'start_time' => '10:00',
        'end_time' => '11:00',
        'status' => AppointmentStatus::NoShow,
    ]);

    $response = $this->getJson('/appointments/availability?date=2026-06-05');

    $response->assertOk();
    $doctors = $response->json('doctors');
    expect($doctors[0]['booked_minutes'])->toBe(0)
        ->and($doctors[0]['is_full'])->toBeFalse();
});

test('booked minutes are computed correctly for active appointments', function () {
    $doctor = Doctor::factory()->create();
    DoctorSchedule::factory()->create([
        'doctor_id' => $doctor->id,
        'day_of_week' => DayOfWeek::Friday,
        'start_time' => '08:00',
        'end_time' => '17:00',
        'is_available' => true,
    ]);

    // 60-minute appointment
    Appointment::factory()->create([
        'doctor_id' => $doctor->id,
        'appointment_date' => '2026-06-05',
        'start_time' => '09:00',
        'end_time' => '10:00',
        'status' => AppointmentStatus::Confirmed,
    ]);

    // 30-minute appointment
    Appointment::factory()->create([
        'doctor_id' => $doctor->id,
        'appointment_date' => '2026-06-05',
        'start_time' => '11:00',
        'end_time' => '11:30',
        'status' => AppointmentStatus::Pending,
    ]);

    $response = $this->getJson('/appointments/availability?date=2026-06-05');

    $response->assertOk();
    $doctors = $response->json('doctors');
    $scheduleDuration = (17 - 8) * 60; // 540 minutes

    expect($doctors[0]['booked_minutes'])->toBe(90)
        ->and($doctors[0]['free_minutes'])->toBe($scheduleDuration - 90)
        ->and($doctors[0]['is_full'])->toBeFalse();
});

test('next_available returns start of schedule when no appointments', function () {
    $doctor = Doctor::factory()->create();
    DoctorSchedule::factory()->create([
        'doctor_id' => $doctor->id,
        'day_of_week' => DayOfWeek::Friday,
        'start_time' => '08:00',
        'end_time' => '17:00',
        'is_available' => true,
    ]);

    $response = $this->getJson('/appointments/availability?date=2026-06-05');

    $response->assertOk();
    expect($response->json('doctors.0.next_available'))->toBe('08:00');
});

test('next_available finds first gap between appointments', function () {
    $doctor = Doctor::factory()->create();
    DoctorSchedule::factory()->create([
        'doctor_id' => $doctor->id,
        'day_of_week' => DayOfWeek::Friday,
        'start_time' => '08:00',
        'end_time' => '17:00',
        'is_available' => true,
    ]);

    // Appointment fills 08:00–09:00
    Appointment::factory()->create([
        'doctor_id' => $doctor->id,
        'appointment_date' => '2026-06-05',
        'start_time' => '08:00',
        'end_time' => '09:00',
        'status' => AppointmentStatus::Confirmed,
    ]);

    $response = $this->getJson('/appointments/availability?date=2026-06-05');

    // First gap is 09:00 (after the only appointment)
    expect($response->json('doctors.0.next_available'))->toBe('09:00');
});

test('next_available is null when doctor schedule is fully booked', function () {
    $doctor = Doctor::factory()->create();
    DoctorSchedule::factory()->create([
        'doctor_id' => $doctor->id,
        'day_of_week' => DayOfWeek::Friday,
        'start_time' => '08:00',
        'end_time' => '09:00', // 1-hour window
        'is_available' => true,
    ]);

    Appointment::factory()->create([
        'doctor_id' => $doctor->id,
        'appointment_date' => '2026-06-05',
        'start_time' => '08:00',
        'end_time' => '09:00',
        'status' => AppointmentStatus::Confirmed,
    ]);

    $response = $this->getJson('/appointments/availability?date=2026-06-05');

    $response->assertOk();
    expect($response->json('doctors.0.next_available'))->toBeNull()
        ->and($response->json('doctors.0.is_full'))->toBeTrue()
        ->and($response->json('is_full'))->toBeTrue();
});

test('doctor_id filter scopes result to a single doctor', function () {
    $doctor1 = Doctor::factory()->create();
    $doctor2 = Doctor::factory()->create();

    $response = $this->getJson("/appointments/availability?date=2026-06-05&doctor_id={$doctor1->id}");

    $response->assertOk();
    $doctors = $response->json('doctors');
    expect($doctors)->toHaveCount(1)
        ->and($doctors[0]['id'])->toBe($doctor1->id);
});

test('summary totals aggregate across all working doctors', function () {
    // Two doctors, each with a 60-minute schedule
    $doctor1 = Doctor::factory()->create();
    $doctor2 = Doctor::factory()->create();

    DoctorSchedule::factory()->create([
        'doctor_id' => $doctor1->id,
        'day_of_week' => DayOfWeek::Friday,
        'start_time' => '08:00',
        'end_time' => '09:00',
        'is_available' => true,
    ]);

    DoctorSchedule::factory()->create([
        'doctor_id' => $doctor2->id,
        'day_of_week' => DayOfWeek::Friday,
        'start_time' => '08:00',
        'end_time' => '09:00',
        'is_available' => true,
    ]);

    // Book 30 minutes on doctor1
    Appointment::factory()->create([
        'doctor_id' => $doctor1->id,
        'appointment_date' => '2026-06-05',
        'start_time' => '08:00',
        'end_time' => '08:30',
        'status' => AppointmentStatus::Confirmed,
    ]);

    $response = $this->getJson('/appointments/availability?date=2026-06-05');

    $response->assertOk();
    expect($response->json('summary.total_minutes'))->toBe(120) // 60 + 60
        ->and($response->json('summary.booked_minutes'))->toBe(30)
        ->and($response->json('summary.free_minutes'))->toBe(90);
});

test('user without appointments.view permission is denied', function () {
    $noPermUser = User::factory()->create(); // no role assigned

    $this->actingAs($noPermUser)
        ->getJson('/appointments/availability')
        ->assertStatus(403);
});
