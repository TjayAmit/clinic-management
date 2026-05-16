<?php

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Queue;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind different classes or traits.
|
*/

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature', 'Unit');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

function actingAsStaff(): TestCase
{
    $user = User::factory()->staff()->create();

    return test()->actingAs($user);
}

function actingAsDoctor(): TestCase
{
    $user = User::factory()->doctor()->create();

    return test()->actingAs($user);
}

function appointmentInQueue(): array
{
    $patient = Patient::factory()->create();
    $doctor = Doctor::factory()->create();
    $service = Service::factory()->create();

    $appointment = Appointment::factory()->create([
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'service_id' => $service->id,
        'appointment_date' => now()->toDateString(),
        'status' => 'pending',
    ]);

    $queue = Queue::factory()->create([
        'appointment_id' => $appointment->id,
        'queue_date' => now()->toDateString(),
        'position' => 1,
        'status' => 'waiting',
    ]);

    return [
        'appointment' => $appointment,
        'queue' => $queue,
        'patient' => $patient,
        'doctor' => $doctor,
        'service' => $service,
    ];
}
