<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case Cash = 'cash';
    case Gcash = 'gcash';
    case Card = 'card';
    case Insurance = 'insurance';

    public function getLabel(): string
    {
        return match ($this) {
            self::Cash => 'Cash',
            self::Gcash => 'GCash',
            self::Card => 'Card',
            self::Insurance => 'Insurance',
        };
    }
}
