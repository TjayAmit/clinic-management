import { Head } from '@inertiajs/react';
import {
    Banknote,
    CircleDollarSign,
    ClockAlert,
    Download,
    Plus,
    Receipt,
    Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BillingIndexProps } from '@/types';

export default function Index({
    stats,
    recentInvoices,
    paymentMethods,
    netCollected,
}: BillingIndexProps) {
    return (
        <>
            <Head title="Billing" />

            <div className="flex h-full flex-1 flex-col gap-4 bg-muted p-4 lg:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                            Billing
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Invoices, payments, and revenue at a glance
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                        <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            New Invoice
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={CircleDollarSign}
                        value={stats.revenueThisMonth}
                        label="Revenue this month"
                        trend="up"
                        trendValue={`+${stats.revenueChangePercent}%`}
                        iconClass="bg-success/10 text-success"
                    />
                    <StatCard
                        icon={ClockAlert}
                        value={stats.outstandingAmount}
                        label="Outstanding"
                        meta={`${stats.outstandingCount} invoices`}
                        iconClass="bg-warning/10 text-warning"
                    />
                    <StatCard
                        icon={Wallet}
                        value={stats.paidTodayAmount}
                        label="Paid today"
                        meta={`${stats.paidTodayCount} payments`}
                        iconClass="bg-header/10 text-header"
                    />
                    <StatCard
                        icon={Banknote}
                        value={stats.overdueAmount}
                        label="Overdue"
                        meta={`${stats.overdueCount} invoices`}
                        iconClass="bg-destructive/10 text-destructive"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
                    <Card>
                        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="text-base">
                                Recent invoices
                            </CardTitle>
                            <Select defaultValue="all">
                                <SelectTrigger className="h-8 w-40 rounded-lg border-border bg-muted text-xs">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All statuses
                                    </SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="partial">
                                        Partial
                                    </SelectItem>
                                    <SelectItem value="pending">
                                        Pending
                                    </SelectItem>
                                    <SelectItem value="overdue">
                                        Overdue
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="text-xs font-medium text-muted-foreground">
                                            INVOICE
                                        </TableHead>
                                        <TableHead className="text-xs font-medium text-muted-foreground">
                                            PATIENT
                                        </TableHead>
                                        <TableHead className="text-xs font-medium text-muted-foreground">
                                            DATE
                                        </TableHead>
                                        <TableHead className="text-xs font-medium text-muted-foreground">
                                            AMOUNT
                                        </TableHead>
                                        <TableHead className="text-xs font-medium text-muted-foreground">
                                            STATUS
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentInvoices.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="py-8 text-center text-sm text-muted-foreground"
                                            >
                                                No invoices yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        recentInvoices.map((invoice) => (
                                            <TableRow key={invoice.id}>
                                                <TableCell>
                                                    <div className="space-y-0.5">
                                                        <p className="text-sm font-semibold text-foreground">
                                                            {
                                                                invoice.invoiceNumber
                                                            }
                                                        </p>
                                                        {invoice.service && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {
                                                                    invoice.service
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                                            {
                                                                invoice.patient
                                                                    .initials
                                                            }
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <p className="text-sm font-medium text-foreground">
                                                                {
                                                                    invoice
                                                                        .patient
                                                                        .fullName
                                                                }
                                                            </p>
                                                            {invoice.service && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    {
                                                                        invoice.service
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {invoice.date}
                                                </TableCell>
                                                <TableCell className="text-sm font-semibold text-foreground">
                                                    {formatCurrency(
                                                        invoice.amount,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={cn(
                                                            'rounded-full px-2.5 py-0.5 text-xs font-medium',
                                                            statusBadgeClass(
                                                                invoice.status,
                                                            ),
                                                        )}
                                                    >
                                                        {statusLabel(
                                                            invoice.status,
                                                        )}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Payment methods
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                {paymentMethods.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        No payments recorded yet.
                                    </p>
                                ) : (
                                    paymentMethods.map((method) => (
                                        <div
                                            key={method.method}
                                            className="flex items-center justify-between gap-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={cn(
                                                        'h-2.5 w-2.5 rounded-full',
                                                        methodDotClass(
                                                            method.method,
                                                        ),
                                                    )}
                                                />
                                                <span className="text-sm font-medium text-foreground">
                                                    {method.method}
                                                </span>
                                            </div>
                                            <span className="text-sm font-semibold text-foreground">
                                                {formatCurrency(method.total)}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        <Card className="bg-header text-header-foreground">
                            <CardContent className="flex flex-col gap-4 p-6">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-header-foreground/80">
                                        {netCollected.label}
                                    </p>
                                    <p className="text-3xl font-semibold tracking-tight">
                                        {formatCurrency(netCollected.amount)}
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full border-header-foreground/20 bg-header-foreground/10 text-header-foreground hover:bg-header-foreground/20"
                                >
                                    <Receipt className="mr-2 h-4 w-4" />
                                    View statement
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Billing', href: '/billing' }]}>
        {page}
    </AppLayout>
);

function StatCard({
    icon: Icon,
    value,
    label,
    meta,
    trend,
    trendValue,
    iconClass,
}: {
    icon: React.ComponentType<{ className?: string }>;
    value: number;
    label: string;
    meta?: string;
    trend?: 'up' | 'down';
    trendValue?: string;
    iconClass: string;
}) {
    return (
        <Card>
            <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between">
                    <div
                        className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-xl',
                            iconClass,
                        )}
                    >
                        <Icon className="h-5 w-5" />
                    </div>
                    {(meta || trendValue) && (
                        <span
                            className={cn(
                                'text-xs font-medium',
                                trend === 'up' && 'text-success',
                                trend === 'down' && 'text-destructive',
                                !trend && 'text-muted-foreground',
                            )}
                        >
                            {meta ?? trendValue}
                        </span>
                    )}
                </div>
                <div className="space-y-0.5">
                    <p className="text-2xl font-semibold tracking-tight text-foreground">
                        {formatCurrency(value)}
                    </p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

function statusBadgeClass(status: string): string {
    switch (status) {
        case 'paid':
            return 'bg-success/10 text-success';
        case 'partial':
            return 'bg-primary/10 text-primary';
        case 'pending':
            return 'bg-warning/10 text-warning';
        case 'overdue':
            return 'bg-destructive/10 text-destructive';
        default:
            return 'bg-muted text-muted-foreground';
    }
}

function statusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function methodDotClass(method: string): string {
    switch (method.toLowerCase()) {
        case 'cash':
            return 'bg-success';
        case 'gcash':
            return 'bg-primary';
        case 'card':
            return 'bg-destructive';
        case 'insurance':
            return 'bg-warning';
        default:
            return 'bg-muted';
    }
}
