<?php

namespace App\Enums;

enum InvoiceStatus: string
{
    case Paid = 'paid';
    case Partial = 'partial';
    case Pending = 'pending';
    case Overdue = 'overdue';

    public function getLabel(): string
    {
        return match ($this) {
            self::Paid => 'Paid',
            self::Partial => 'Partial',
            self::Pending => 'Pending',
            self::Overdue => 'Overdue',
        };
    }
}
