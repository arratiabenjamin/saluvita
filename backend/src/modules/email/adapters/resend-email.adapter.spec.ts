import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResendEmailAdapter } from './resend-email.adapter';

function makeConfigService(overrides: Record<string, string | undefined> = {}): ConfigService {
  return {
    get: jest.fn((key: string) => overrides[key]),
  } as unknown as ConfigService;
}

describe('ResendEmailAdapter', () => {
  describe('constructor', () => {
    it('should throw InternalServerErrorException when RESEND_API_KEY is absent', () => {
      const configService = makeConfigService({ RESEND_API_KEY: undefined });
      expect(() => new ResendEmailAdapter(configService)).toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException when RESEND_API_KEY is empty string', () => {
      const configService = makeConfigService({ RESEND_API_KEY: '' });
      expect(() => new ResendEmailAdapter(configService)).toThrow(InternalServerErrorException);
    });

    it('should instantiate when RESEND_API_KEY is present', () => {
      const configService = makeConfigService({
        RESEND_API_KEY: 'test-key',
        RESEND_FROM: 'test@example.com',
      });
      expect(() => new ResendEmailAdapter(configService)).not.toThrow();
    });
  });

  describe('sendPasswordResetEmail', () => {
    let adapter: ResendEmailAdapter;
    let fetchSpy: jest.SpyInstance;

    beforeEach(() => {
      const configService = makeConfigService({
        RESEND_API_KEY: 're_test_key',
        RESEND_FROM: 'noreply@saluvita.app',
      });
      adapter = new ResendEmailAdapter(configService);

      fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
      } as Response);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should call fetch with the Resend API endpoint', async () => {
      await adapter.sendPasswordResetEmail('user@example.com', 'http://link?token=abc');

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://api.resend.com/emails',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer re_test_key',
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('should include recipient and reset link in the request body', async () => {
      await adapter.sendPasswordResetEmail('patient@example.com', 'http://localhost/reset?token=xyz');

      const [[, options]] = fetchSpy.mock.calls as [string, RequestInit][];
      const parsedBody = JSON.parse(options.body as string);
      expect(parsedBody.to).toContain('patient@example.com');
      expect(parsedBody.html).toContain('http://localhost/reset?token=xyz');
    });

    it('should throw InternalServerErrorException when Resend API returns non-ok response', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 422,
        text: jest.fn().mockResolvedValue('Invalid address'),
      } as unknown as Response);

      await expect(
        adapter.sendPasswordResetEmail('bad@example.com', 'http://link'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
