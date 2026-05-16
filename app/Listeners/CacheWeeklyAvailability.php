<?php

namespace App\Listeners;

use App\Events\AppointmentCreated;
use App\Services\AvailabilityService;
use Illuminate\Contracts\Queue\ShouldQueue;

class CacheWeeklyAvailability implements ShouldQueue
{
    public function handle(AppointmentCreated $event): void
    {
        app(AvailabilityService::class)->warmWeek();
    }
}
