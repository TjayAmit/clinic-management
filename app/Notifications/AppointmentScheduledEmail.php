<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AppointmentScheduledEmail extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Appointment $appointment) {}

    public function via(object $notifiable): array
    {
        // Patients have no system access — mail only, no database channel
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $date = $this->appointment->appointment_date->format('l, F j, Y');

        return (new MailMessage)
            ->subject("Your Appointment is Confirmed — {$date}")
            ->markdown(
                'emails.appointment.scheduled-patient',
                ['appointment' => $this->appointment],
            );
    }
}
