<?php

namespace App\Http\Controllers\Dev;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Notifications\AppointmentBooked;
use App\Notifications\AppointmentCancelled;
use App\Notifications\AppointmentCompleted;
use App\Notifications\AppointmentConfirmed;
use Illuminate\Http\Response;

class EmailPreviewController extends Controller
{
    private static array $emails = [
        'appointment-booked-patient'    => ['label' => 'Appointment Booked',     'recipient' => 'Patient'],
        'appointment-booked-doctor'     => ['label' => 'Appointment Booked',     'recipient' => 'Doctor'],
        'appointment-confirmed-patient' => ['label' => 'Appointment Confirmed',  'recipient' => 'Patient'],
        'appointment-confirmed-doctor'  => ['label' => 'Appointment Confirmed',  'recipient' => 'Doctor'],
        'appointment-cancelled-patient' => ['label' => 'Appointment Cancelled',  'recipient' => 'Patient'],
        'appointment-cancelled-doctor'  => ['label' => 'Appointment Cancelled',  'recipient' => 'Doctor'],
        'appointment-completed-patient' => ['label' => 'Appointment Completed',  'recipient' => 'Patient'],
    ];

    public function index(): Response
    {
        $items = collect(self::$emails)->map(fn ($meta, $key) => [
            'key'       => $key,
            'url'       => url("/dev/email-preview/{$key}"),
            'label'     => $meta['label'],
            'recipient' => $meta['recipient'],
        ])->values();

        $html = view('dev.email-preview-index', ['items' => $items])->render();

        return response($html);
    }

    public function show(string $key): Response
    {
        abort_unless(array_key_exists($key, self::$emails), 404, "Email preview '{$key}' not found.");

        $appointment = $this->sampleAppointment();
        $html = match ($key) {
            'appointment-booked-patient'    => (new AppointmentBooked($appointment, 'patient'))->toMail($appointment->patient)->render(),
            'appointment-booked-doctor'     => (new AppointmentBooked($appointment, 'doctor'))->toMail($appointment->doctor->user)->render(),
            'appointment-confirmed-patient' => (new AppointmentConfirmed($appointment, 'patient'))->toMail($appointment->patient)->render(),
            'appointment-confirmed-doctor'  => (new AppointmentConfirmed($appointment, 'doctor'))->toMail($appointment->doctor->user)->render(),
            'appointment-cancelled-patient' => (new AppointmentCancelled($appointment, 'patient'))->toMail($appointment->patient)->render(),
            'appointment-cancelled-doctor'  => (new AppointmentCancelled($appointment, 'doctor'))->toMail($appointment->doctor->user)->render(),
            'appointment-completed-patient' => (new AppointmentCompleted($appointment))->toMail($appointment->patient)->render(),
        };

        return response($html);
    }

    private function sampleAppointment(): Appointment
    {
        $appointment = Appointment::with(['patient', 'doctor.user', 'service'])
            ->whereHas('patient')
            ->whereHas('doctor.user')
            ->whereHas('service')
            ->latest()
            ->first();

        if (! $appointment) {
            $appointment = Appointment::factory()->create();
            $appointment->load(['patient', 'doctor.user', 'service']);
        }

        return $appointment;
    }
}
