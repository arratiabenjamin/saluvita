import { Injectable, Logger } from '@nestjs/common';
import { EmailSender } from '../email.types';

@Injectable()
export class LogEmailAdapter implements EmailSender {
  private readonly logger = new Logger(LogEmailAdapter.name);

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    this.logger.log(`Password reset email for ${to}`);
    this.logger.log(`PASSWORD_RESET_LINK:${resetLink}`);
  }
}
