<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AppointmentCompleted extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Appointment $appointment,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Thank You for Your Visit')
            ->markdown('emails.appointment.completed-patient', ['appointment' => $this->appointment]);
    }

    public function toArray(object $notifiable): array
    {
        $appointment = $this->appointment;

        return [
            'type'             => 'appointment_completed',
            'appointment_id'   => $appointment->id,
            'patient_name'     => $appointment->patient->full_name,
            'doctor_name'      => 'Dr. ' . $appointment->doctor->user->name,
            'service'          => $appointment->service->name,
            'appointment_date' => $appointment->appointment_date->toDateString(),
            'message'          => "Your appointment for {$appointment->service->name} on {$appointment->appointment_date->format('F j, Y')} has been completed. Thank you for visiting!",
        ];
    }
}
