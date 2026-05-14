<x-mail::message>
# Thank you for your visit

We hope everything went smoothly, **{{ $appointment->patient->full_name }}**. Here's a summary of your visit today.

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
<tr>
<td style="padding: 12px 20px; color: #94A3B8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; vertical-align: top;">Date</td>
<td style="padding: 12px 20px; color: #1E293B; font-size: 14px; font-weight: 500; vertical-align: top;">{{ $appointment->appointment_date->format('l, F j, Y') }}</td>
</tr>
</table>
</div>

<div style="background-color: #FFF7ED; border-left: 4px solid #F97316; border-radius: 0 6px 6px 0; padding: 14px 18px; margin: 20px 0;">
<p style="margin: 0; color: #92400E; font-size: 14px; line-height: 1.6;">Have questions about your treatment or need to book a follow-up? Don't hesitate to reach out to us.</p>
</div>

Regards,<br>
{{ config('app.name') }}
</x-mail::message>
