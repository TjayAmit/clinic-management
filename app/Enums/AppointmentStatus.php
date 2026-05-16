<?php

namespace App\Enums;

enum AppointmentStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case InQueue = 'in_queue';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case NeedsFollowUp = 'needs_follow_up';
    case Cancelled = 'cancelled';
    case NoShow = 'no_show';

    public function getLabel(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Confirmed => 'Confirmed',
            self::InQueue => 'In Queue',
            self::InProgress => 'In Progress',
            self::Completed => 'Completed',
            self::NeedsFollowUp => 'Needs Follow-up',
            self::Cancelled => 'Cancelled',
            self::NoShow => 'No Show',
        };
    }
}
