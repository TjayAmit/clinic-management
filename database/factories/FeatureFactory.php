<?php

namespace Database\Factories;

use App\Models\Feature;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Feature>
 */
class FeatureFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'name'        => ucwords($name),
            'key'         => Str::slug($name, '_'),
            'description' => fake()->optional()->sentence(),
            'is_enabled'  => false,
            'enabled_by'  => null,
            'enabled_at'  => null,
        ];
    }

    public function enabled(): static
    {
        return $this->state(fn () => [
            'is_enabled' => true,
            'enabled_by' => User::factory(),
            'enabled_at' => now(),
        ]);
    }
}
