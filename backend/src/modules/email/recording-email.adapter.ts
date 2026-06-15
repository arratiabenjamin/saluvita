import { EmailSender } from './email.types';
import { LastResetLinkStore } from './last-reset-link.store';

/**
 * Decorator over any EmailSender implementation.
 * Delegates the actual send to the wrapped adapter and captures the last
 * reset link in LastResetLinkStore for dev/test purposes only.
 * This class is intentionally NOT decorated with @Injectable — it is wired
 * manually by the factory in EmailModule only when NODE_ENV !== 'production'.
 */
export class RecordingEmailAdapter implements EmailSender {
  constructor(
    private readonly inner: EmailSender,
    private readonly store: LastResetLinkStore,
  ) {}

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    await this.inner.sendPasswordResetEmail(to, resetLink);
    this.store.set(to, resetLink);
  }
}
