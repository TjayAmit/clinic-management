<?php

use App\Models\Doctor;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $staffUser = User::factory()->staff()->create();
    $this->actingAs($staffUser);
});

test('staff can list patients', function () {
    Patient::factory()->count(3)->create();

    $response = $this->get('/patients');

    $response->assertStatus(200);
});

test('staff can search patients by name', function () {
    Patient::factory()->create(['first_name' => 'John', 'last_name' => 'Doe']);
    Patient::factory()->create(['first_name' => 'Jane', 'last_name' => 'Smith']);

    $response = $this->get('/patients?search=John');

    $response->assertStatus(200);
});

test('staff can create a new patient', function () {
    $response = $this->post('/patients', [
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'john@example.com',
        'phone' => '1234567890',
        'date_of_birth' => '1990-01-01',
        'gender' => 'male',
        'address' => '123 Main St',
    ]);

    $response->assertRedirect('/patients');
    $this->assertDatabaseHas('patients', ['email' => 'john@example.com']);
});

test('validation fails without required fields', function () {
    $response = $this->post('/patients', [
        'first_name' => 'John',
    ]);

    $response->assertSessionHasErrors(['last_name', 'email']);
});

test('staff can update a patient', function () {
    $patient = Patient::factory()->create();

    $response = $this->put("/patients/{$patient->id}", [
        'first_name' => 'Jane',
        'last_name' => 'Smith',
        'email' => 'jane@example.com',
        'phone' => '0987654321',
        'date_of_birth' => '1990-01-01',
        'gender' => 'female',
        'address' => '456 Oak Ave',
    ]);

    $response->assertRedirect('/patients');
    $this->assertDatabaseHas('patients', [
        'id' => $patient->id,
        'first_name' => 'Jane',
    ]);
});

test('staff can delete a patient', function () {
    $patient = Patient::factory()->create();

    $response = $this->delete("/patients/{$patient->id}");

    $response->assertRedirect('/patients');
    $this->assertSoftDeleted('patients', ['id' => $patient->id]);
});

test('doctor cannot create a patient', function () {
    $doctorUser = User::factory()->doctor()->create();
    $this->actingAs($doctorUser);

    $response = $this->post('/patients', [
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'john@example.com',
    ]);

    $response->assertStatus(403);
});
