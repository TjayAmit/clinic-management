<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AppointmentCancelled extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Appointment $appointment,
        public readonly string $recipientType = 'patient',
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $appointment = $this->appointment;
        $date = $appointment->appointment_date->format('F j, Y');
        $time = date('g:i A', strtotime($appointment->start_time));

        if ($this->recipientType === 'doctor') {
            return (new MailMessage)
                ->subject('Appointment Cancelled')
                ->greeting('Hello, Dr. ' . $appointment->doctor->user->name . '!')
                ->line('The following appointment has been cancelled.')
                ->line("**Patient:** {$appointment->patient->full_name}")
                ->line("**Service:** {$appointment->service->name}")
                ->line("**Date:** {$date}")
                ->line("**Time:** {$time}")
                ->line('Your schedule has been updated accordingly.');
        }

        return (new MailMessage)
            ->subject('Appointment Cancelled')
            ->greeting('Hello, ' . $appointment->patient->full_name . '!')
            ->line('Your appointment has been cancelled.')
            ->line("**Service:** {$appointment->service->name}")
            ->line("**Doctor:** Dr. {$appointment->doctor->user->name}")
            ->line("**Date:** {$date}")
            ->line("**Time:** {$time}")
            ->line('If you would like to reschedule, please contact us or book a new appointment.')
            ->line('We hope to see you soon!');
    }

    public function toArray(object $notifiable): array
    {
        $appointment = $this->appointment;

        return [
            'type'             => 'appointment_cancelled',
            'appointment_id'   => $appointment->id,
            'patient_name'     => $appointment->patient->full_name,
            'doctor_name'      => 'Dr. ' . $appointment->doctor->user->name,
            'service'          => $appointment->service->name,
            'appointment_date' => $appointment->appointment_date->toDateString(),
            'start_time'       => $appointment->start_time,
            'message'          => $this->recipientType === 'doctor'
                ? "Appointment cancelled: {$appointment->patient->full_name} on {$appointment->appointment_date->format('F j, Y')} at {$appointment->start_time}."
                : "Your appointment for {$appointment->service->name} on {$appointment->appointment_date->format('F j, Y')} has been cancelled.",
        ];
    }
}
