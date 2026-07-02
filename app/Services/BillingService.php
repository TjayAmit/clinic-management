<?php

namespace App\Services;

use App\Enums\InvoiceStatus;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class BillingService
{
    public function getIndexData(): array
    {
        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();
        $today = $now->copy()->startOfDay();

        $thisMonthRevenue = Invoice::whereIn('status', [InvoiceStatus::Paid, InvoiceStatus::Partial])
            ->whereBetween('issue_date', [$startOfMonth, $now])
            ->sum('amount');

        $lastMonthRevenue = Invoice::whereIn('status', [InvoiceStatus::Paid, InvoiceStatus::Partial])
            ->whereBetween('issue_date', [$startOfLastMonth, $endOfLastMonth])
            ->sum('amount');

        $revenueChangePercent = $lastMonthRevenue > 0
            ? round((($thisMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
            : 0;

        $outstandingInvoices = Invoice::whereIn('status', [InvoiceStatus::Pending, InvoiceStatus::Partial])
            ->get();

        $outstandingAmount = $outstandingInvoices->sum(fn (Invoice $invoice) => $invoice->amount - $invoice->amount_paid);
        $outstandingCount = $outstandingInvoices->count();

        $paidTodayAmount = Payment::whereDate('paid_at', $today)->sum('amount');
        $paidTodayCount = Payment::whereDate('paid_at', $today)->count();

        $overdueInvoices = Invoice::where('status', InvoiceStatus::Overdue)
            ->orWhere(function ($query) use ($today) {
                $query->whereIn('status', [InvoiceStatus::Pending, InvoiceStatus::Partial])
                    ->whereDate('due_date', '<', $today);
            })
            ->get();

        $overdueAmount = $overdueInvoices->sum(fn (Invoice $invoice) => $invoice->amount - $invoice->amount_paid);
        $overdueCount = $overdueInvoices->count();

        $netCollected = Payment::whereBetween('paid_at', [$startOfMonth, $now])
            ->sum('amount');

        $recentInvoices = Invoice::with(['patient', 'service'])
            ->orderByDesc('issue_date')
            ->orderByDesc('id')
            ->limit(8)
            ->get();

        $paymentMethods = Payment::select('payment_method', DB::raw('SUM(amount) as total'))
            ->groupBy('payment_method')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'method' => $row->payment_method->getLabel(),
                'total' => (float) $row->total,
            ]);

        return [
            'stats' => [
                'revenueThisMonth' => (float) $thisMonthRevenue,
                'revenueChangePercent' => $revenueChangePercent,
                'outstandingAmount' => (float) $outstandingAmount,
                'outstandingCount' => $outstandingCount,
                'paidTodayAmount' => (float) $paidTodayAmount,
                'paidTodayCount' => $paidTodayCount,
                'overdueAmount' => (float) $overdueAmount,
                'overdueCount' => $overdueCount,
            ],
            'recentInvoices' => $this->mapRecentInvoices($recentInvoices),
            'paymentMethods' => $paymentMethods,
            'netCollected' => [
                'label' => 'Net collected - ' . $now->format('F'),
                'amount' => (float) $netCollected,
            ],
        ];
    }

    private function mapRecentInvoices(Collection $invoices): array
    {
        return $invoices->map(fn (Invoice $invoice) => [
            'id' => $invoice->id,
            'invoiceNumber' => $invoice->invoice_number,
            'patient' => [
                'id' => $invoice->patient_id,
                'fullName' => $invoice->patient?->full_name,
                'initials' => $this->initials($invoice->patient?->full_name ?? ''),
            ],
            'service' => $invoice->service?->name,
            'date' => $invoice->issue_date?->format('M d, Y'),
            'amount' => (float) $invoice->amount,
            'status' => $invoice->status->value,
        ])->all();
    }

    private function initials(string $name): string
    {
        $parts = array_filter(explode(' ', trim($name)));

        if (count($parts) === 0) {
            return '?';
        }

        if (count($parts) === 1) {
            return strtoupper(substr($parts[0], 0, 1));
        }

        return strtoupper(substr($parts[0], 0, 1) . substr($parts[count($parts) - 1], 0, 1));
    }
}
