<x-mail::message>
# We received your booking

Thank you, **{{ $appointment->patient->full_name }}**. Your appointment request has been submitted and is awaiting confirmation from our team.

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

No action is needed from you right now. We'll send a confirmation email as soon as your appointment is reviewed.

Regards,<br>
{{ config('app.name') }}
</x-mail::message>
