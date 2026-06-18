import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailSender } from '../email.types';

@Injectable()
export class ResendEmailAdapter implements EmailSender {
  private readonly logger = new Logger(ResendEmailAdapter.name);
  private readonly apiKey: string;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException(
        'RESEND_API_KEY is required when EMAIL_PROVIDER=resend',
      );
    }
    this.apiKey = apiKey;
    this.from = this.configService.get<string>('RESEND_FROM') ?? 'noreply@saluvita.app';
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    const body = JSON.stringify({
      from: this.from,
      to: [to],
      subject: 'Restablece tu contraseña — Saluvita',
      html: this.passwordResetHtml(resetLink),
      text: this.passwordResetText(resetLink),
    });

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body,
    });

    if (!response.ok) {
      const text = await response.text();
      this.logger.error(`Resend API error: ${response.status} ${text}`);
      throw new InternalServerErrorException('Failed to send password reset email');
    }
  }

  /** Plain-text fallback for email clients that don't render HTML. */
  private passwordResetText(resetLink: string): string {
    return [
      'Recupera tu contraseña de Saluvita',
      '',
      'Recibimos una solicitud para restablecer la contraseña de tu cuenta.',
      'Abre este enlace para crear una nueva contraseña:',
      resetLink,
      '',
      'El enlace expira en 1 hora y solo puede usarse una vez.',
      'Si no solicitaste este cambio, puedes ignorar este correo: tu contraseña no se modificará.',
    ].join('\n');
  }

  /** Branded, responsive HTML template (Spanish, voseo) for the reset email. */
  private passwordResetHtml(resetLink: string): string {
    return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Restablece tu contraseña</title>
  </head>
  <body style="margin:0;padding:0;background-color:#F8FAFC;font-family:'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#24434A;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Restablece tu contraseña de Saluvita. El enlace expira en 1 hora.</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8FAFC;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(37,99,235,0.08);">
            <tr>
              <td style="background-color:#2563EB;padding:28px 32px;text-align:center;">
                <span style="color:#FFFFFF;font-size:24px;font-weight:800;letter-spacing:0.5px;">Saluvita</span>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 32px 8px 32px;">
                <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:800;color:#24434A;">Recupera tu contraseña</h1>
                <p style="margin:0 0 24px 0;font-size:15px;line-height:1.7;color:#5E7B80;">
                  Recibimos una solicitud para restablecer la contraseña de tu cuenta de Saluvita.
                  Haz clic en el botón para crear una nueva.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 8px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius:12px;background-color:#2563EB;">
                      <a href="${resetLink}" target="_blank"
                        style="display:inline-block;padding:15px 40px;font-size:16px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:12px;">
                        Restablecer contraseña
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 0 32px;">
                <p style="margin:0;font-size:14px;line-height:1.7;color:#5E7B80;">
                  Por seguridad, este enlace <strong style="color:#24434A;">expira en 1 hora</strong> y solo puede usarse una vez.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 0 32px;">
                <p style="margin:0 0 6px 0;font-size:13px;color:#5E7B80;">¿El botón no funciona? Copia y pega este enlace en tu navegador:</p>
                <p style="margin:0;font-size:13px;word-break:break-all;">
                  <a href="${resetLink}" target="_blank" style="color:#2563EB;text-decoration:underline;">${resetLink}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px 0 32px;">
                <hr style="border:none;border-top:1px solid #DBEAFE;margin:0;" />
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 36px 32px;">
                <p style="margin:0 0 8px 0;font-size:13px;line-height:1.6;color:#5E7B80;">
                  Si no solicitaste este cambio, puedes ignorar este correo de forma segura: tu contraseña no se modificará.
                </p>
                <p style="margin:0;font-size:12px;color:#9DB2B6;">© Saluvita · Gestión de agenda médica</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  }
}
