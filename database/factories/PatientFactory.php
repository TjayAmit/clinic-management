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
            'first_name' => fake()->firstName($gender === Gender::Male ? 'male' : 'female'),
            'middle_name' => fake()->optional()->firstName(),
            'last_name' => fake()->lastName(),
            'date_of_birth' => fake()->dateTimeBetween('-80 years', '-5 years')->format('Y-m-d'),
            'gender' => $gender,
            'civil_status' => fake()->optional()->randomElement(['single', 'married', 'divorced', 'widowed', 'separated']),
            'occupation' => fake()->optional()->jobTitle(),
            'nationality' => fake()->optional()->country(),
            'blood_type' => fake()->optional()->randomElement(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']),
            'phone' => fake()->phoneNumber(),
            'email' => fake()->optional()->safeEmail(),
            'address' => fake()->optional()->address(),
            'street_address' => fake()->optional()->streetAddress(),
            'city' => fake()->optional()->city(),
            'province' => fake()->optional()->state(),
            'emergency_contact_name' => fake()->optional()->name(),
            'emergency_contact_relationship' => fake()->optional()->randomElement(['Parent', 'Spouse', 'Sibling', 'Guardian', 'Friend']),
            'emergency_contact_phone' => fake()->optional()->phoneNumber(),
            'allergies' => fake()->optional()->randomElement([
                null, 'Penicillin', 'Aspirin', 'Latex', 'Ibuprofen',
                'Amoxicillin', 'Codeine',
            ]),
            'medical_history' => fake()->optional()->sentences(2, true),
            'is_regular' => fake()->boolean(20),
        ];
    }
}
