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
        public readonly string $recipientType = 'doctor',
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

        if ($this->recipientType === 'patient') {
            return (new MailMessage)
                ->subject('Appointment Confirmed')
                ->greeting('Hello, ' . $appointment->patient->full_name . '!')
                ->line('Great news! Your appointment has been confirmed.')
                ->line("**Service:** {$appointment->service->name}")
                ->line("**Doctor:** Dr. {$appointment->doctor->user->name}")
                ->line("**Date:** {$date}")
                ->line("**Time:** {$time}")
                ->line('Please arrive a few minutes early. If you need to cancel or reschedule, contact us as soon as possible.')
                ->line('We look forward to seeing you!');
        }

        return (new MailMessage)
            ->subject('Appointment Confirmed')
            ->greeting('Hello, Dr. ' . $appointment->doctor->user->name . '!')
            ->line('The following appointment has been confirmed.')
            ->line("**Patient:** {$appointment->patient->full_name}")
            ->line("**Service:** {$appointment->service->name}")
            ->line("**Date:** {$date}")
            ->line("**Time:** {$time}")
            ->action('View Appointment', url('/appointments/' . $appointment->id))
            ->line('Please prepare accordingly.');
    }

    public function toArray(object $notifiable): array
    {
        $appointment = $this->appointment;

        return [
            'type'             => 'appointment_confirmed',
            'appointment_id'   => $appointment->id,
            'patient_name'     => $appointment->patient->full_name,
            'doctor_name'      => 'Dr. ' . $appointment->doctor->user->name,
            'service'          => $appointment->service->name,
            'appointment_date' => $appointment->appointment_date->toDateString(),
            'start_time'       => $appointment->start_time,
            'message'          => $this->recipientType === 'patient'
                ? "Your appointment for {$appointment->service->name} on {$appointment->appointment_date->format('F j, Y')} at {$appointment->start_time} has been confirmed."
                : "Appointment confirmed: {$appointment->patient->full_name} on {$appointment->appointment_date->format('F j, Y')} at {$appointment->start_time}.",
        ];
    }
}
