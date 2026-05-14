<x-mail::message>
# Your appointment has been cancelled

We're sorry, **{{ $appointment->patient->full_name }}**. The following appointment has been cancelled.

<div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; margin: 24px 0;">
<table style="width: 100%; border-collapse: collapse;" role="presentation">
<tr style="border-bottom: 1px solid #E2E8F0;">
<td style="padding: 12px 20px; color: #94A3B8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; width: 36%; vertical-align: top;">Service</td>
<td style="padding: 12px 20px; color: #1E293B; font-size: 14px; font-weight: 500; vertical-align: top;">{{ $appointment->service->name }}</td>
</tr>
<tr style="border-bottom: 1px solid #E2E8F0;">
<td style="padding: 12px 20px; color: #94A3B8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; vertical-align: top;">Doctor</td>
<td style="padding: 12px 20px; color: #1E293B; font-size: 14px; font-weight: 500; vertical-align: top;">Dr. {{ $appointment->doctor->user->name }}</td>
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

<div style="background-color: #FEF2F2; border-left: 4px solid #EF4444; border-radius: 0 6px 6px 0; padding: 14px 18px; margin: 20px 0;">
<p style="margin: 0; color: #B91C1C; font-size: 14px; line-height: 1.6;">Need to reschedule? Our team is ready to help you find a new time that works.</p>
</div>

<x-mail::button :url="url('/')" color="error">
Book a New Appointment
</x-mail::button>

Regards,<br>
{{ config('app.name') }}
</x-mail::message>
