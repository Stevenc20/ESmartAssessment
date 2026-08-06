<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $judul }}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            margin: 0;
            padding: 24px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .header {
            background-color: #436391;
            padding: 24px 32px;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 700;
            letter-spacing: -0.02em;
        }
        .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-top: 8px;
        }
        .badge-info { background-color: #dbeafe; color: #1e40af; }
        .badge-warning { background-color: #fef3c7; color: #92400e; }
        .badge-maintenance { background-color: #f3e8ff; color: #6b21a8; }
        .content {
            padding: 32px;
            line-height: 1.6;
        }
        .title {
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 0;
            margin-bottom: 12px;
        }
        .body-text {
            font-size: 14px;
            color: #334155;
            white-space: pre-line;
            margin-bottom: 24px;
        }
        .btn-wrapper {
            text-align: center;
            margin: 28px 0 12px;
        }
        .btn {
            display: inline-block;
            background-color: #436391;
            color: #ffffff !important;
            font-weight: 700;
            font-size: 14px;
            padding: 12px 28px;
            border-radius: 12px;
            text-decoration: none;
            box-shadow: 0 2px 4px rgba(67, 99, 145, 0.2);
        }
        .footer {
            background-color: #f1f5f9;
            padding: 16px 32px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>e-Smart Assessment</h1>
            <span class="badge badge-{{ $type }}">{{ strtoupper($source) }}</span>
        </div>
        <div class="content">
            <h2 class="title">{{ $judul }}</h2>
            <div class="body-text">{!! nl2br(e($isi)) !!}</div>
            
            <div class="btn-wrapper">
                <a href="{{ $actionUrl ?? config('app.url') }}" class="btn" target="_blank">
                    Buka Aplikasi e-Smart Assessment
                </a>
            </div>
        </div>
        <div class="footer">
            Email ini dikirim secara otomatis oleh sistem e-Smart Assessment.<br>
            Mohon untuk tidak membalas email ini secara langsung.
        </div>
    </div>
</body>
</html>
