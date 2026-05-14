@props(['url'])
<tr>
<td class="header" style="padding: 32px 0 20px; background-color: #F0F4F8; text-align: center;">
<a href="{{ $url }}" style="display: inline-flex; align-items: center; gap: 10px; text-decoration: none;">
    {{-- Tooth icon SVG --}}
    <span style="display: inline-block; background-color: #F97316; border-radius: 10px; padding: 8px; line-height: 0;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C9.243 2 7 4.243 7 7c0 1.38.52 2.638 1.373 3.589C7.52 11.538 7 12.62 7 14c0 2.757 1.5 5.5 2 7 .5 1.5 1 2 2 2s1.5-1 2-3c.5 2 1 3 2 3s1.5-.5 2-2c.5-1.5 2-4.243 2-7 0-1.38-.52-2.462-1.373-3.411C18.48 9.638 19 8.38 19 7c0-2.757-2.243-5-7-5z" fill="white" opacity="0.95"/>
        </svg>
    </span>
    <span style="color: #1E293B; font-size: 20px; font-weight: 700; font-family: 'Inter', -apple-system, sans-serif; letter-spacing: -0.01em;">
        {{ config('app.name') }}
    </span>
</a>
</td>
</tr>
