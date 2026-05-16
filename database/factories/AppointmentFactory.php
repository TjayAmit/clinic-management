<?php

namespace Database\Factories;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Appointment>
 */
class AppointmentFactory extends Factory
{
    public function definition(): array
    {
        $startHour = fake()->numberBetween(8, 16);
        $startMinute = fake()->randomElement([0, 30]);
        $duration = fake()->randomElement([30, 45, 60, 90]);
        $start = sprintf('%02d:%02d', $startHour, $startMinute);
        $endMinutes = ($startHour * 60 + $startMinute + $duration);
        $end = sprintf('%02d:%02d', intdiv($endMinutes, 60), $endMinutes % 60);

        return [
            'patient_id' => Patient::factory(),
            'doctor_id' => Doctor::factory(),
            'service_id' => Service::factory(),
            'appointment_date' => fake()->dateTimeBetween('now', '+3 months')->format('Y-m-d'),
            'start_time' => $start,
            'end_time' => $end,
            'status' => AppointmentStatus::Pending,
            'notes' => fake()->optional()->sentence(),
            'created_by' => User::factory(),
            'is_walk_in' => false,
            'teeth_involved' => null,
            'parent_appointment_id' => null,
        ];
    }

    public function walkIn(): static
    {
        return $this->state([
            'is_walk_in' => true,
            'appointment_date' => now()->toDateString(),
        ]);
    }

    public function confirmed(): static
    {
        return $this->state(['status' => AppointmentStatus::Confirmed]);
    }

    public function inQueue(): static
    {
        return $this->state(['status' => AppointmentStatus::InQueue]);
    }

    public function inProgress(): static
    {
        return $this->state(['status' => AppointmentStatus::InProgress]);
    }

    public function completed(): static
    {
        return $this->state([
            'status' => AppointmentStatus::Completed,
            'appointment_date' => fake()->dateTimeBetween('-3 months', 'now')->format('Y-m-d'),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(['status' => AppointmentStatus::Cancelled]);
    }

    public function noShow(): static
    {
        return $this->state(['status' => AppointmentStatus::NoShow]);
    }

    public function needsFollowUp(): static
    {
        return $this->state(['status' => AppointmentStatus::NeedsFollowUp]);
    }

    public function withTeeth(array $teeth = []): static
    {
        return $this->state([
            'teeth_involved' => $teeth ?: fake()->randomElements(range(1, 32), fake()->numberBetween(1, 4)),
        ]);
    }

    public function withPatient(?Patient $patient = null): static
    {
        return $this->state(fn () => [
            'patient_id' => $patient ?? Patient::factory(),
        ]);
    }

    public function withDoctor(?Doctor $doctor = null): static
    {
        return $this->state(fn () => [
            'doctor_id' => $doctor ?? Doctor::factory(),
        ]);
    }

    public function withStatus(AppointmentStatus $status): static
    {
        return $this->state(['status' => $status]);
    }
}
