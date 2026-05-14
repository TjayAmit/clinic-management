<?php

namespace Database\Factories;

use App\Enums\ServiceCategory;
use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Service>
 */
class ServiceFactory extends Factory
{
    private static array $singleVisit = [
        'Tooth Extraction'     => [30, 60, 500, 1500],
        'Dental Cleaning'      => [45, 60, 300, 800],
        'Simple Filling'       => [30, 60, 400, 1200],
        'Dental X-Ray'         => [15, 30, 200, 500],
        'Fluoride Treatment'   => [20, 30, 150, 400],
        'Dental Sealant'       => [30, 45, 300, 600],
        'Teeth Whitening'      => [60, 90, 800, 2500],
    ];

    private static array $longTerm = [
        'Braces (Metal)'         => [60, 90, 25000, 60000],
        'Braces (Ceramic)'       => [60, 90, 35000, 75000],
        'Root Canal Treatment'   => [60, 120, 5000, 15000],
        'Dental Implant'         => [60, 120, 30000, 80000],
        'Dentures (Full)'        => [60, 90, 15000, 40000],
        'Dental Crown'           => [60, 90, 5000, 15000],
        'Invisalign'             => [60, 90, 50000, 120000],
    ];

    public function definition(): array
    {
        $category = fake()->randomElement(ServiceCategory::cases());
        $pool = $category === ServiceCategory::SingleVisit ? self::$singleVisit : self::$longTerm;
        $name = fake()->randomElement(array_keys($pool));
        [$minDur, $maxDur, $minPrice, $maxPrice] = $pool[$name];

        return [
            'name'             => $name,
            'description'      => fake()->optional()->sentence(),
            'category'         => $category,
            'price'            => fake()->numberBetween($minPrice, $maxPrice),
            'duration_minutes' => fake()->numberBetween($minDur, $maxDur),
            'is_active'        => true,
        ];
    }

    public function singleVisit(): static
    {
        $name = fake()->randomElement(array_keys(self::$singleVisit));
        [$minDur, $maxDur, $minPrice, $maxPrice] = self::$singleVisit[$name];

        return $this->state([
            'category'         => ServiceCategory::SingleVisit,
            'name'             => $name,
            'duration_minutes' => fake()->numberBetween($minDur, $maxDur),
            'price'            => fake()->numberBetween($minPrice, $maxPrice),
        ]);
    }

    public function longTerm(): static
    {
        $name = fake()->randomElement(array_keys(self::$longTerm));
        [$minDur, $maxDur, $minPrice, $maxPrice] = self::$longTerm[$name];

        return $this->state([
            'category'         => ServiceCategory::LongTerm,
            'name'             => $name,
            'duration_minutes' => fake()->numberBetween($minDur, $maxDur),
            'price'            => fake()->numberBetween($minPrice, $maxPrice),
        ]);
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
