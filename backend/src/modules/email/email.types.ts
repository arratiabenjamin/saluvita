export const EMAIL_SENDER = Symbol('EMAIL_SENDER');

export interface EmailSender {
  sendPasswordResetEmail(to: string, resetLink: string): Promise<void>;
}
