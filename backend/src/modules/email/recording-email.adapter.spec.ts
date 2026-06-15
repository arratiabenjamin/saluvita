import { LastResetLinkStore } from './last-reset-link.store';
import { RecordingEmailAdapter } from './recording-email.adapter';
import { EmailSender } from './email.types';

function makeInner(): jest.Mocked<EmailSender> {
  return { sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined) };
}

describe('LastResetLinkStore', () => {
  let store: LastResetLinkStore;

  beforeEach(() => {
    store = new LastResetLinkStore();
  });

  it('returns null before any entry is stored', () => {
    expect(store.get()).toBeNull();
  });

  it('stores and retrieves an entry', () => {
    store.set('user@example.com', 'http://localhost:5173/reset-password?token=abc123');
    const entry = store.get();
    expect(entry).not.toBeNull();
    expect(entry!.to).toBe('user@example.com');
    expect(entry!.resetLink).toBe('http://localhost:5173/reset-password?token=abc123');
    expect(entry!.capturedAt).toBeInstanceOf(Date);
  });

  it('overwrites previous entry on subsequent set calls', () => {
    store.set('first@example.com', 'http://localhost:5173/reset-password?token=first');
    store.set('second@example.com', 'http://localhost:5173/reset-password?token=second');
    const entry = store.get();
    expect(entry!.to).toBe('second@example.com');
    expect(entry!.resetLink).toContain('second');
  });

  it('clears the entry when clear() is called', () => {
    store.set('user@example.com', 'http://localhost:5173/reset-password?token=abc');
    store.clear();
    expect(store.get()).toBeNull();
  });
});

describe('RecordingEmailAdapter', () => {
  let store: LastResetLinkStore;
  let inner: jest.Mocked<EmailSender>;
  let adapter: RecordingEmailAdapter;

  beforeEach(() => {
    store = new LastResetLinkStore();
    inner = makeInner();
    adapter = new RecordingEmailAdapter(inner, store);
  });

  it('delegates sendPasswordResetEmail to the inner adapter', async () => {
    await adapter.sendPasswordResetEmail('user@example.com', 'http://reset?token=xyz');
    expect(inner.sendPasswordResetEmail).toHaveBeenCalledWith(
      'user@example.com',
      'http://reset?token=xyz',
    );
    expect(inner.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
  });

  it('records the reset link in the store after delegation', async () => {
    await adapter.sendPasswordResetEmail('patient@clinic.com', 'http://reset?token=tok99');
    const entry = store.get();
    expect(entry).not.toBeNull();
    expect(entry!.to).toBe('patient@clinic.com');
    expect(entry!.resetLink).toBe('http://reset?token=tok99');
  });

  it('does NOT record if inner adapter throws', async () => {
    inner.sendPasswordResetEmail.mockRejectedValueOnce(new Error('SMTP failure'));
    await expect(
      adapter.sendPasswordResetEmail('user@example.com', 'http://reset?token=fail'),
    ).rejects.toThrow('SMTP failure');
    expect(store.get()).toBeNull();
  });
});
