<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Peringatan Kehadiran</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;">
                    <tr>
                        <td style="background-color:#dc2626;padding:24px 32px;">
                            <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">Peringatan Kehadiran Rendah</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px;">
                            <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">Halo <strong>{{ $siswa->name }}</strong>,</p>
                            <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">
                                Kami mendeteksi kehadiran kamu pada roadmap
                                <strong>{{ $roadmap->judul }}</strong> saat ini berada di
                                <strong style="color:#dc2626;">{{ $persentase }}%</strong>,
                                di bawah batas minimum kehadiran <strong>{{ $threshold }}%</strong>.
                            </p>
                            <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">
                                Mohon perhatikan kehadiran kamu pada pertemuan berikutnya agar tetap memenuhi syarat pembelajaran.
                            </p>
                            <p style="margin:0;color:#64748b;font-size:14px;line-height:1.6;">Terima kasih,<br>{{ config('app.name') }}</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
