<?php

use App\Enums\AppointmentStatus;
use App\Models\Appointment;

test('all cases resolve to correct string values', function () {
    expect(AppointmentStatus::Pending->value)->toBe('pending');
    expect(AppointmentStatus::Confirmed->value)->toBe('confirmed');
    expect(AppointmentStatus::InQueue->value)->toBe('in_queue');
    expect(AppointmentStatus::InProgress->value)->toBe('in_progress');
    expect(AppointmentStatus::Completed->value)->toBe('completed');
    expect(AppointmentStatus::NeedsFollowUp->value)->toBe('needs_follow_up');
    expect(AppointmentStatus::Cancelled->value)->toBe('cancelled');
    expect(AppointmentStatus::NoShow->value)->toBe('no_show');
});

test('getLabel returns human-readable label for every case', function () {
    expect(AppointmentStatus::Pending->getLabel())->toBe('Pending');
    expect(AppointmentStatus::Confirmed->getLabel())->toBe('Confirmed');
    expect(AppointmentStatus::InQueue->getLabel())->toBe('In Queue');
    expect(AppointmentStatus::InProgress->getLabel())->toBe('In Progress');
    expect(AppointmentStatus::Completed->getLabel())->toBe('Completed');
    expect(AppointmentStatus::NeedsFollowUp->getLabel())->toBe('Needs Follow-up');
    expect(AppointmentStatus::Cancelled->getLabel())->toBe('Cancelled');
    expect(AppointmentStatus::NoShow->getLabel())->toBe('No Show');
});

test('casting from string works on Appointment model', function () {
    $appointment = Appointment::factory()->make(['status' => 'confirmed']);

    expect($appointment->status)->toBeInstanceOf(AppointmentStatus::class);
    expect($appointment->status->value)->toBe('confirmed');
});
