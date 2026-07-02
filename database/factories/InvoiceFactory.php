<?php

namespace Database\Factories;

use App\Enums\InvoiceStatus;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    public function definition(): array
    {
        $amount = fake()->randomElement([500, 1200, 2500, 3500, 5000, 6500, 8000, 12000]);
        $status = fake()->randomElement(InvoiceStatus::cases());
        $amountPaid = match ($status) {
            InvoiceStatus::Paid => $amount,
            InvoiceStatus::Partial => $amount * fake()->randomFloat(2, 0.3, 0.7),
            default => 0,
        };

        $issueDate = fake()->dateTimeBetween('-90 days', 'now');
        $dueDate = (clone $issueDate)->modify('+14 days');

        return [
            'invoice_number' => 'INV-' . fake()->unique()->numberBetween(1000, 9999),
            'patient_id' => Patient::factory(),
            'appointment_id' => null,
            'service_id' => Service::factory(),
            'amount' => $amount,
            'amount_paid' => round($amountPaid, 2),
            'status' => $status,
            'issue_date' => $issueDate,
            'due_date' => $dueDate,
            'notes' => fake()->optional(0.3)->sentence(),
        ];
    }

    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => InvoiceStatus::Paid,
            'amount_paid' => $attributes['amount'],
        ]);
    }

    public function overdue(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => InvoiceStatus::Overdue,
            'due_date' => fake()->dateTimeBetween('-60 days', '-1 day'),
        ]);
    }
}
