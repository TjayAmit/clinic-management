<?php

namespace Database\Factories;

use App\Enums\Gender;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Patient>
 */
class PatientFactory extends Factory
{
    public function definition(): array
    {
        $gender = fake()->randomElement(Gender::cases());

        return [
            'first_name'              => fake()->firstName($gender === Gender::Male ? 'male' : 'female'),
            'last_name'               => fake()->lastName(),
            'date_of_birth'           => fake()->dateTimeBetween('-80 years', '-5 years')->format('Y-m-d'),
            'gender'                  => $gender,
            'blood_type'              => fake()->optional()->randomElement(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']),
            'phone'                   => fake()->phoneNumber(),
            'email'                   => fake()->optional()->safeEmail(),
            'address'                 => fake()->optional()->address(),
            'emergency_contact_name'  => fake()->optional()->name(),
            'emergency_contact_phone' => fake()->optional()->phoneNumber(),
            'allergies'               => fake()->optional()->randomElement([
                null, 'Penicillin', 'Aspirin', 'Latex', 'Ibuprofen',
                'Amoxicillin', 'Codeine',
            ]),
            'dental_history'          => fake()->optional()->sentences(2, true),
        ];
    }
}
