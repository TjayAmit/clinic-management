<?php

namespace App\Enums;

enum Gender: string
{
    case Male   = 'male';
    case Female = 'female';
    case Other  = 'other';

    public function getLabel(): string
    {
        return match ($this) {
            self::Male   => 'Male',
            self::Female => 'Female',
            self::Other  => 'Other',
        };
    }
}
