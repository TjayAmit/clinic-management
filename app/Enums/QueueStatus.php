<?php

namespace App\Enums;

enum QueueStatus: string
{
    case Waiting = 'waiting';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case NoShow = 'no_show';

    public function getLabel(): string
    {
        return match ($this) {
            self::Waiting => 'Waiting',
            self::InProgress => 'In Progress',
            self::Completed => 'Completed',
            self::NoShow => 'No Show',
        };
    }
}
