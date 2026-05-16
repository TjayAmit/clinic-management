<?php

namespace Database\Factories;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\PatientVisit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PatientVisit>
 */
class PatientVisitFactory extends Factory
{
    public function definition(): array
    {
        $visitedAt = fake()->dateTimeBetween('-6 months', 'now');
        $checkInAt = fake()->dateTimeBetween($visitedAt, (clone $visitedAt)->modify('+30 minutes'));
        $checkOutAt = fake()->optional(0.8)->dateTimeBetween($checkInAt, (clone $checkInAt)->modify('+2 hours'));

        return [
            'patient_id' => Patient::factory(),
            'doctor_id' => Doctor::factory(),
            'appointment_id' => null,
            'visited_at' => $visitedAt,
            'check_in_at' => $checkInAt,
            'check_out_at' => $checkOutAt,
            'blood_pressure' => fake()->optional()->randomElement(['110/70', '120/80', '130/85', '140/90', '115/75']),
            'temperature' => fake()->optional()->randomFloat(1, 36.0, 38.5),
            'weight' => fake()->optional()->randomFloat(2, 30, 150),
            'heart_rate' => fake()->optional()->numberBetween(55, 110),
            'notes' => fake()->optional()->sentence(),
        ];
    }

    public function withAppointment(): static
    {
        return $this->state(fn (array $attributes) => [
            'appointment_id' => Appointment::factory()->state([
                'patient_id' => $attributes['patient_id'],
                'doctor_id' => $attributes['doctor_id'],
            ]),
        ]);
    }

    public function checkedOut(): static
    {
        return $this->state(function (array $attributes) {
            $checkIn = $attributes['check_in_at'] ?? now()->subHours(2);

            return ['check_out_at' => fake()->dateTimeBetween($checkIn, now())];
        });
    }
}
