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
      subject: 'Reset your Saluvita password',
      html: `
        <p>You requested a password reset for your Saluvita account.</p>
        <p><a href="${resetLink}">Reset your password</a></p>
        <p>This link expires in 1 hour and can only be used once.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
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
}
