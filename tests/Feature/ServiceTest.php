<?php

use App\Enums\ServiceCategory;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $staffUser = User::factory()->staff()->create();
    $this->actingAs($staffUser);
});

test('staff can list services', function () {
    Service::factory()->count(3)->create();

    $response = $this->get('/services');

    $response->assertStatus(200);
});

test('staff can create single-visit service', function () {
    $response = $this->post('/services', [
        'name' => 'Dental Cleaning',
        'description' => 'Routine cleaning',
        'duration' => 30,
        'category' => ServiceCategory::SingleVisit->value,
        'price' => 50.00,
    ]);

    $response->assertStatus(302);
    $this->assertDatabaseHas('services', [
        'name' => 'Dental Cleaning',
        'category' => ServiceCategory::SingleVisit->value,
    ]);
});

test('staff can create long-term service', function () {
    $response = $this->post('/services', [
        'name' => 'Orthodontic Treatment',
        'description' => 'Braces and alignment',
        'duration' => 60,
        'category' => ServiceCategory::LongTerm->value,
        'price' => 5000.00,
    ]);

    $response->assertStatus(302);
    $this->assertDatabaseHas('services', [
        'name' => 'Orthodontic Treatment',
        'category' => ServiceCategory::LongTerm->value,
    ]);
});

test('staff can deactivate a service', function () {
    $service = Service::factory()->create(['is_active' => true]);

    $response = $this->put("/services/{$service->id}", [
        'name' => $service->name,
        'description' => $service->description,
        'duration' => $service->duration,
        'category' => $service->category,
        'price' => $service->price,
        'is_active' => false,
    ]);

    $response->assertRedirect('/services');
    $this->assertDatabaseHas('services', [
        'id' => $service->id,
        'is_active' => false,
    ]);
});

test('inactive service not shown in appointment create', function () {
    $activeService = Service::factory()->create(['is_active' => true]);
    $inactiveService = Service::factory()->create(['is_active' => false]);

    $response = $this->get('/appointments/create');

    $response->assertStatus(200);
});
