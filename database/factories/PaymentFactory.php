<?php

namespace Database\Factories;

use App\Enums\PaymentMethod;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'invoice_id' => Invoice::factory(),
            'amount' => fake()->randomElement([500, 1200, 2500, 3500, 5000, 6500, 8000, 12000]),
            'payment_method' => fake()->randomElement(PaymentMethod::cases()),
            'paid_at' => fake()->dateTimeBetween('-90 days', 'now'),
            'notes' => fake()->optional(0.3)->sentence(),
        ];
    }
}
