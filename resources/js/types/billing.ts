export type BillingStats = {
    revenueThisMonth: number;
    revenueChangePercent: number;
    outstandingAmount: number;
    outstandingCount: number;
    paidTodayAmount: number;
    paidTodayCount: number;
    overdueAmount: number;
    overdueCount: number;
};

export type BillingInvoice = {
    id: number;
    invoiceNumber: string;
    patient: {
        id: number;
        fullName: string | null;
        initials: string;
    };
    service: string | null;
    date: string | null;
    amount: number;
    status: 'paid' | 'partial' | 'pending' | 'overdue';
};

export type PaymentMethodSummary = {
    method: string;
    total: number;
};

export type NetCollected = {
    label: string;
    amount: number;
};

export type BillingIndexProps = {
    stats: BillingStats;
    recentInvoices: BillingInvoice[];
    paymentMethods: PaymentMethodSummary[];
    netCollected: NetCollected;
};
