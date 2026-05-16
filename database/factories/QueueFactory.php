<?php

namespace Database\Factories;

use App\Enums\QueueStatus;
use App\Models\Appointment;
use App\Models\Queue;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Queue>
 */
class QueueFactory extends Factory
{
    public function definition(): array
    {
        return [
            'appointment_id' => Appointment::factory(),
            'queue_date' => now()->toDateString(),
            'position' => fake()->numberBetween(1, 20),
            'status' => QueueStatus::Waiting,
            'called_at' => null,
            'completed_at' => null,
        ];
    }

    public function inProgress(): static
    {
        return $this->state([
            'status' => QueueStatus::InProgress,
            'called_at' => now()->subMinutes(fake()->numberBetween(5, 45)),
        ]);
    }

    public function completed(): static
    {
        return $this->state(function () {
            $calledAt = now()->subMinutes(fake()->numberBetween(30, 120));

            return [
                'status' => QueueStatus::Completed,
                'called_at' => $calledAt,
                'completed_at' => fake()->dateTimeBetween($calledAt, now()),
            ];
        });
    }

    public function noShow(): static
    {
        return $this->state(['status' => QueueStatus::NoShow]);
    }
}
