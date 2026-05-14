<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AppointmentBooked extends Notification implements ShouldQueue
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
                ->subject('New Appointment Assigned')
                ->greeting('Hello, Dr. ' . $appointment->doctor->user->name . '!')
                ->line('A new appointment has been booked and assigned to you.')
                ->line("**Patient:** {$appointment->patient->full_name}")
                ->line("**Service:** {$appointment->service->name}")
                ->line("**Date:** {$date}")
                ->line("**Time:** {$time}")
                ->action('View Appointment', url('/appointments/' . $appointment->id))
                ->line('Please review the appointment details in the system.');
        }

        return (new MailMessage)
            ->subject('Appointment Booked Successfully')
            ->greeting('Hello, ' . $appointment->patient->full_name . '!')
            ->line('Your appointment has been booked successfully.')
            ->line("**Service:** {$appointment->service->name}")
            ->line("**Doctor:** Dr. {$appointment->doctor->user->name}")
            ->line("**Date:** {$date}")
            ->line("**Time:** {$time}")
            ->line('Your appointment is currently **pending confirmation**. You will receive another notification once confirmed.')
            ->line('Thank you for choosing our clinic!');
    }

    public function toArray(object $notifiable): array
    {
        $appointment = $this->appointment;

        return [
            'type'             => 'appointment_booked',
            'appointment_id'   => $appointment->id,
            'patient_name'     => $appointment->patient->full_name,
            'doctor_name'      => 'Dr. ' . $appointment->doctor->user->name,
            'service'          => $appointment->service->name,
            'appointment_date' => $appointment->appointment_date->toDateString(),
            'start_time'       => $appointment->start_time,
            'message'          => $this->recipientType === 'doctor'
                ? "New appointment booked: {$appointment->patient->full_name} on {$appointment->appointment_date->format('F j, Y')} at {$appointment->start_time}."
                : "Your appointment for {$appointment->service->name} on {$appointment->appointment_date->format('F j, Y')} at {$appointment->start_time} has been booked.",
        ];
    }
}
