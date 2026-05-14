<?php

namespace Database\Factories;

use App\Models\Doctor;
use App\Models\DoctorSchedule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DoctorSchedule>
 */
class DoctorScheduleFactory extends Factory
{
    public function definition(): array
    {
        $startHour = fake()->numberBetween(7, 14);
        $endHour   = $startHour + fake()->numberBetween(4, 8);
        $endHour   = min($endHour, 20);

        return [
            'doctor_id'    => Doctor::factory(),
            'day_of_week'  => fake()->numberBetween(0, 6),
            'start_time'   => sprintf('%02d:00', $startHour),
            'end_time'     => sprintf('%02d:00', $endHour),
            'is_available' => true,
        ];
    }

    public function unavailable(): static
    {
        return $this->state(['is_available' => false]);
    }

    public function weekday(): static
    {
        return $this->state(['day_of_week' => fake()->numberBetween(1, 5)]);
    }
}
