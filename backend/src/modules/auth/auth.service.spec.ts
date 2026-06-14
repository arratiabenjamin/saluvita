import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { EmailSender } from '../email/email.types';

// ---------- helpers ----------

function makeUser(overrides: Partial<{ id: string; email: string; status: string; deletedAt: Date | null }> = {}) {
  return {
    id: 'user-1',
    email: 'user@example.com',
    passwordHash: '$2a$10$hashedpassword',
    firstName: 'Test',
    lastName: 'User',
    status: 'ACTIVE',
    deletedAt: null,
    ...overrides,
  };
}

function makeTokenRecord(overrides: Partial<{
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
}> = {}) {
  return {
    id: 'token-1',
    userId: 'user-1',
    tokenHash: 'dummyhash',
    expiresAt: new Date(Date.now() + 3600_000),
    usedAt: null,
    ...overrides,
  };
}

// ---------- factory ----------

function makeAuthService() {
  const mockPrisma = {
    user: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    passwordResetToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  } as any;

  const mockJwt = { signAsync: jest.fn().mockResolvedValue('access-token') } as unknown as JwtService;

  const mockConfig = {
    get: jest.fn((key: string) => {
      const map: Record<string, string> = {
        JWT_ACCESS_SECRET: 'test-secret',
        JWT_ACCESS_EXPIRES_IN: '15m',
        JWT_REFRESH_TTL_DAYS: '30',
        APP_RESET_URL_BASE: 'http://localhost:5173/reset-password',
        PASSWORD_RESET_TTL_MINUTES: '60',
      };
      return map[key];
    }),
  } as unknown as ConfigService;

  const mockEmailSender: EmailSender = {
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  };

  const service = new AuthService(mockPrisma, mockJwt, mockConfig, mockEmailSender);
  return { service, mockPrisma, mockEmailSender, mockConfig };
}

// ---------- forgotPassword ----------

describe('AuthService.forgotPassword', () => {
  it('(a) creates token and sends email for existing active user', async () => {
    const { service, mockPrisma, mockEmailSender } = makeAuthService();
    const user = makeUser();
    mockPrisma.user.findFirst.mockResolvedValue(user);
    mockPrisma.passwordResetToken.create.mockResolvedValue({});

    const result = await service.forgotPassword('user@example.com');

    expect(mockPrisma.passwordResetToken.create).toHaveBeenCalledTimes(1);
    const createCall = mockPrisma.passwordResetToken.create.mock.calls[0][0];
    expect(createCall.data.userId).toBe(user.id);
    expect(createCall.data.tokenHash).toBeDefined();
    expect(createCall.data.expiresAt).toBeInstanceOf(Date);

    expect(mockEmailSender.sendPasswordResetEmail).toHaveBeenCalledWith(
      user.email,
      expect.stringContaining('token='),
    );
    expect(result).toHaveProperty('message');
  });

  it('(b) non-existing user: no token created, no email sent, same response', async () => {
    const { service, mockPrisma, mockEmailSender } = makeAuthService();
    mockPrisma.user.findFirst.mockResolvedValue(null);

    const result = await service.forgotPassword('unknown@example.com');

    expect(mockPrisma.passwordResetToken.create).not.toHaveBeenCalled();
    expect(mockEmailSender.sendPasswordResetEmail).not.toHaveBeenCalled();
    expect(result).toHaveProperty('message');
  });
});

// ---------- resetPassword ----------

describe('AuthService.resetPassword', () => {
  it('(c) valid token: updates password, marks token used, revokes refresh tokens', async () => {
    const { service, mockPrisma } = makeAuthService();
    const user = makeUser();
    const tokenRecord = makeTokenRecord({ userId: user.id });

    const txMock = {
      passwordResetToken: {
        findFirst: jest.fn().mockResolvedValue(tokenRecord),
        update: jest.fn().mockResolvedValue({}),
      },
      user: {
        update: jest.fn().mockResolvedValue({}),
      },
      refreshToken: {
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    };

    mockPrisma.$transaction.mockImplementation(async (cb: (tx: any) => Promise<any>) => cb(txMock));

    await service.resetPassword('plaintoken', 'NewPass123!');

    expect(txMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: user.id } }),
    );
    expect(txMock.passwordResetToken.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: tokenRecord.id }, data: { usedAt: expect.any(Date) } }),
    );
    expect(txMock.refreshToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      }),
    );
  });

  it('(d) used token throws BadRequestException', async () => {
    const { service, mockPrisma } = makeAuthService();
    // The service queries with usedAt: null — a used token won't match, so findFirst returns null
    mockPrisma.$transaction.mockImplementation(async (cb: (tx: any) => Promise<any>) => {
      const tx = {
        passwordResetToken: {
          findFirst: jest.fn().mockResolvedValue(null),
          update: jest.fn(),
        },
        user: { update: jest.fn() },
        refreshToken: { updateMany: jest.fn() },
      };
      return cb(tx);
    });

    await expect(service.resetPassword('usedtoken', 'NewPass123!')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('(e) expired token throws BadRequestException', async () => {
    const { service, mockPrisma } = makeAuthService();

    mockPrisma.$transaction.mockImplementation(async (cb: (tx: any) => Promise<any>) => {
      const tx = {
        passwordResetToken: {
          findFirst: jest.fn().mockResolvedValue(null),
          update: jest.fn(),
        },
        user: { update: jest.fn() },
        refreshToken: { updateMany: jest.fn() },
      };
      return cb(tx);
    });

    await expect(service.resetPassword('expiredtoken', 'NewPass123!')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('(f) forged token throws BadRequestException', async () => {
    const { service, mockPrisma } = makeAuthService();

    mockPrisma.$transaction.mockImplementation(async (cb: (tx: any) => Promise<any>) => {
      const tx = {
        passwordResetToken: {
          findFirst: jest.fn().mockResolvedValue(null),
          update: jest.fn(),
        },
        user: { update: jest.fn() },
        refreshToken: { updateMany: jest.fn() },
      };
      return cb(tx);
    });

    await expect(service.resetPassword('forgedtoken', 'NewPass123!')).rejects.toThrow(
      BadRequestException,
    );
  });
});
