<tr>
<td style="padding: 20px 0 32px; background-color: #F0F4F8;">
<table class="footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
<tr>
<td class="content-cell" align="center" style="padding: 0 40px;">
    <p style="color: #94A3B8; font-size: 12px; text-align: center; margin: 0 0 6px; line-height: 1.6;">
        {{ Illuminate\Mail\Markdown::parse($slot) }}
    </p>
    <p style="color: #CBD5E1; font-size: 11px; text-align: center; margin: 0;">
        You are receiving this email because you have an account with {{ config('app.name') }}.
    </p>
</td>
</tr>
</table>
</td>
</tr>
