<?php

use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;

test('debug gate check directly', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('Staff');

    $this->actingAs($user);

    // Test gate directly inside the request
    Route::get('/test-gate', function () {
        $user = auth()->user();
        $gateResult = Gate::forUser($user)->check('appointments.view');
        $canResult = $user->can('appointments.view');
        $inspectResult = Gate::inspect('appointments.view');

        return response()->json([
            'gate_for_user' => $gateResult,
            'user_can' => $canResult,
            'gate_inspect_allowed' => $inspectResult->allowed(),
            'gate_inspect_message' => $inspectResult->message(),
            'user_id' => $user->id,
        ]);
    })->middleware(['web', 'auth']);

    $response = $this->get('/test-gate');
    dump(['gate_test' => $response->json()]);

    // Now the actual appointments route
    $r2 = $this->get('/appointments');
    dump(['appointments_status' => $r2->status()]);
});
