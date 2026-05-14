<?php

namespace App\Enums;

enum ServiceCategory: string
{
    case SingleVisit = 'single_visit';
    case LongTerm    = 'long_term';

    public function getLabel(): string
    {
        return match ($this) {
            self::SingleVisit => 'Single Visit',
            self::LongTerm    => 'Long Term',
        };
    }
}
