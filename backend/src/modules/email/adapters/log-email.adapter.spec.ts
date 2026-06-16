import { Logger } from '@nestjs/common';
import { LogEmailAdapter } from './log-email.adapter';

describe('LogEmailAdapter', () => {
  let adapter: LogEmailAdapter;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    adapter = new LogEmailAdapter();
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log the reset link with sentinel prefix', async () => {
    const resetLink = 'http://localhost:5173/reset-password?token=abc123';
    await adapter.sendPasswordResetEmail('user@example.com', resetLink);

    const calls = logSpy.mock.calls.map((args) => String(args[0]));
    const sentinelCall = calls.find((msg) => msg.startsWith('PASSWORD_RESET_LINK:'));
    expect(sentinelCall).toBeDefined();
    expect(sentinelCall).toBe(`PASSWORD_RESET_LINK:${resetLink}`);
  });

  it('should log the recipient email', async () => {
    await adapter.sendPasswordResetEmail('patient@example.com', 'http://link');

    const calls = logSpy.mock.calls.map((args) => String(args[0]));
    expect(calls.some((msg) => msg.includes('patient@example.com'))).toBe(true);
  });

  it('should resolve without errors', async () => {
    await expect(
      adapter.sendPasswordResetEmail('user@example.com', 'http://link'),
    ).resolves.toBeUndefined();
  });
});
