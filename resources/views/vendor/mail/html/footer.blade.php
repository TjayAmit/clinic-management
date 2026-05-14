<tr>
<td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 24px 40px 28px; text-align: center; border-radius: 0 0 10px 10px;">

<p style="margin: 0 0 4px; color: #334155; font-size: 13px; font-weight: 700; font-family: 'Inter', -apple-system, sans-serif; letter-spacing: -0.01em;">
    {{ config('app.name') }}
</p>

<p style="margin: 0 0 14px; color: #64748B; font-size: 12px; font-family: 'Inter', -apple-system, sans-serif; line-height: 1.7;">
    {{ config('clinic.address') }} &nbsp;&middot;&nbsp; {{ config('clinic.city') }}<br>
    {{ config('clinic.phone') }} &nbsp;&middot;&nbsp; <a href="mailto:{{ config('clinic.email') }}" style="color: #64748B; text-decoration: none;">{{ config('clinic.email') }}</a>
</p>

<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
<tr><td style="height: 1px; background-color: #E2E8F0; font-size: 0; line-height: 0;">&nbsp;</td></tr>
</table>

<p style="margin: 14px 0 4px; color: #94A3B8; font-size: 11px; font-family: 'Inter', -apple-system, sans-serif; line-height: 1.6;">
    This is an automated message — please do not reply directly to this email.
</p>

<p style="margin: 0; color: #CBD5E1; font-size: 11px; font-family: 'Inter', -apple-system, sans-serif;">
    &copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
</p>

</td>
</tr>
