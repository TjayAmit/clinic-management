<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Previews</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f3f4f6; padding: 2rem; }
        h1 { font-size: 1.5rem; font-weight: 700; color: #111; margin-bottom: 0.25rem; }
        p.sub { color: #6b7280; font-size: 0.9rem; margin-bottom: 2rem; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
        .card {
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 1px 3px rgba(0,0,0,.1);
            padding: 1.25rem 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            text-decoration: none;
            transition: box-shadow .15s, transform .15s;
        }
        .card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.15); transform: translateY(-2px); }
        .card-header { display: flex; align-items: center; justify-content: space-between; }
        .card-title { font-size: 1rem; font-weight: 600; color: #111; }
        .badge {
            font-size: 0.7rem;
            font-weight: 600;
            padding: 0.2rem 0.6rem;
            border-radius: 999px;
            text-transform: uppercase;
            letter-spacing: .04em;
        }
        .badge-patient { background: #dbeafe; color: #1d4ed8; }
        .badge-doctor  { background: #dcfce7; color: #15803d; }
        .card-url { font-size: 0.75rem; color: #9ca3af; font-family: monospace; }
    </style>
</head>
<body>
    <h1>Email Previews</h1>
    <p class="sub">Click any card to preview the rendered email in the browser. Local environment only.</p>
    <div class="grid">
        @foreach ($items as $item)
        <a class="card" href="{{ $item['url'] }}" target="_blank">
            <div class="card-header">
                <span class="card-title">{{ $item['label'] }}</span>
                <span class="badge badge-{{ strtolower($item['recipient']) }}">{{ $item['recipient'] }}</span>
            </div>
            <span class="card-url">/dev/email-preview/{{ $item['key'] }}</span>
        </a>
        @endforeach
    </div>
</body>
</html>
