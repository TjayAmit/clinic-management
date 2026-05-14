<x-mail::message>
# Appointment confirmed

**Dr. {{ $appointment->doctor->user->name }}**, the following appointment has been confirmed and is on your schedule.

<div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; margin: 24px 0;">
<table style="width: 100%; border-collapse: collapse;" role="presentation">
<tr style="border-bottom: 1px solid #E2E8F0;">
<td style="padding: 12px 20px; color: #94A3B8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; width: 36%; vertical-align: top;">Patient</td>
<td style="padding: 12px 20px; color: #1E293B; font-size: 14px; font-weight: 500; vertical-align: top;">{{ $appointment->patient->full_name }}</td>
</tr>
<tr style="border-bottom: 1px solid #E2E8F0;">
<td style="padding: 12px 20px; color: #94A3B8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; vertical-align: top;">Service</td>
<td style="padding: 12px 20px; color: #1E293B; font-size: 14px; font-weight: 500; vertical-align: top;">{{ $appointment->service->name }}</td>
</tr>
<tr style="border-bottom: 1px solid #E2E8F0;">
<td style="padding: 12px 20px; color: #94A3B8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; vertical-align: top;">Date</td>
<td style="padding: 12px 20px; color: #1E293B; font-size: 14px; font-weight: 500; vertical-align: top;">{{ $appointment->appointment_date->format('l, F j, Y') }}</td>
</tr>
<tr>
<td style="padding: 12px 20px; color: #94A3B8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; vertical-align: top;">Time</td>
<td style="padding: 12px 20px; color: #1E293B; font-size: 14px; font-weight: 500; vertical-align: top;">{{ date('g:i A', strtotime($appointment->start_time)) }}</td>
</tr>
</table>
</div>

<x-mail::button :url="url('/appointments/' . $appointment->id)">
View Appointment
</x-mail::button>

Regards,<br>
{{ config('app.name') }}
</x-mail::message>
