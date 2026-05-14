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
        $view = $this->recipientType === 'doctor'
            ? 'emails.appointment.booked-doctor'
            : 'emails.appointment.booked-patient';

        $subject = $this->recipientType === 'doctor'
            ? 'New Appointment Assigned'
            : 'Appointment Request Received';

        return (new MailMessage)
            ->subject($subject)
            ->markdown($view, ['appointment' => $this->appointment]);
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
