<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AppointmentConfirmed extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Appointment $appointment,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'appointment_id'   => $this->appointment->id,
            'patient_name'     => $this->appointment->patient->full_name,
            'service'          => $this->appointment->service->name,
            'appointment_date' => $this->appointment->appointment_date->toDateString(),
            'start_time'       => $this->appointment->start_time,
            'end_time'         => $this->appointment->end_time,
            'message'          => "Appointment confirmed for {$this->appointment->patient->full_name} on {$this->appointment->appointment_date->toDateString()} at {$this->appointment->start_time}.",
        ];
    }
}
