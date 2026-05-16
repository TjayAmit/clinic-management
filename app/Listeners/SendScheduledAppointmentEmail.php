<?php

namespace App\Listeners;

use App\Events\AppointmentCreated;
use App\Notifications\AppointmentScheduledEmail;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendScheduledAppointmentEmail implements ShouldQueue
{
    public function handle(AppointmentCreated $event): void
    {
        $appointment = $event->appointment;

        // Walk-ins are never notified
        if ($appointment->is_walk_in) {
            return;
        }

        // Must have a linked patient record
        if (! $appointment->patient) {
            return;
        }

        // Patient must have an email on file
        if (! $appointment->patient->email) {
            return;
        }

        // Only regular patients receive scheduled appointment emails
        if (! $appointment->patient->is_regular) {
            return;
        }

        // Same-day appointments do not get a notification
        if ($appointment->appointment_date->isToday()) {
            return;
        }

        // Ensure all relations needed by the notification are loaded
        $appointment->loadMissing('patient', 'service', 'doctor.user');

        $appointment->patient->notify(new AppointmentScheduledEmail($appointment));
    }
}
