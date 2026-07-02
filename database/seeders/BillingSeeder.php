<?php

namespace Database\Seeders;

use App\Enums\InvoiceStatus;
use App\Enums\PaymentMethod;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Database\Seeder;

class BillingSeeder extends Seeder
{
    public function run(): void
    {
        Invoice::factory()
            ->count(30)
            ->create()
            ->each(function (Invoice $invoice) {
                if ($invoice->amount_paid <= 0) {
                    return;
                }

                Payment::factory()
                    ->for($invoice)
                    ->create([
                        'amount' => $invoice->amount_paid,
                        'payment_method' => PaymentMethod::cases()[array_rand(PaymentMethod::cases())],
                        'paid_at' => $invoice->issue_date,
                    ]);
            });
    }
}
