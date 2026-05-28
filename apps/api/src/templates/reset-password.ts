export function resetPasswordEmail({
  name,
  resetUrl,
  expiresInMinutes = 60,
}: {
  name: string;
  resetUrl: string;
  expiresInMinutes?: number;
}): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Restablecer contrasena</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e3a8a,#2563eb);padding:36px 40px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:12px 20px;">
                <span style="color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.5px;">SaaS Boilerplate</span>
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#0f172a;">Restablecer contrasena</p>
              <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">
                Hola <strong style="color:#374151;">${name}</strong>, recibimos una solicitud para restablecer la contrasena de tu cuenta.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 28px;">
                    <a href="${resetUrl}"
                       style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:10px;letter-spacing:0.1px;">
                      Restablecer contrasena
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Warning box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#fef9ee;border:1px solid #fde68a;border-radius:10px;padding:14px 18px;">
                    <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">
                      ⏱ Este enlace expira en <strong>${expiresInMinutes} minutos</strong>.
                      Si no solicitaste este cambio, puedes ignorar este correo — tu contrasena no cambiara.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Fallback URL -->
              <p style="margin:0 0 6px;font-size:13px;color:#94a3b8;">Si el boton no funciona, copia este enlace en tu navegador:</p>
              <p style="margin:0;font-size:12px;color:#2563eb;word-break:break-all;">${resetUrl}</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #f1f5f9;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                Este email fue enviado automaticamente. Por favor no respondas a este correo.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
