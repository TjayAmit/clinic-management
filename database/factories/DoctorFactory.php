<?php

namespace Database\Factories;

use App\Models\Doctor;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Doctor>
 */
class DoctorFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'specialization' => fake()->randomElement([
                'General Dentistry', 'Orthodontics', 'Endodontics',
                'Periodontics', 'Oral Surgery', 'Pediatric Dentistry',
                'Prosthodontics', 'Oral Medicine',
            ]),
            'license_number' => strtoupper(fake()->bothify('??-#####')),
            'phone' => fake()->phoneNumber(),
            'bio' => fake()->optional()->paragraph(),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
