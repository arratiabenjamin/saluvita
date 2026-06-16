import { BadRequestException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { AuthService } from './auth.service';
import { EmailSender } from '../email/email.types';
import { ROLE_PATIENT } from '../../shared/auth/roles.constants';
import { PatientDocumentTypeEnum } from '../patients/domain/enums/patient-document-type.enum';

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

function makeRole(overrides: Partial<{ id: string; code: string; name: string }> = {}) {
  return { id: 'role-patient', code: ROLE_PATIENT, name: 'Patient', ...overrides };
}

function makeRegisterDto(overrides: Record<string, unknown> = {}) {
  return {
    email: 'new@example.com',
    password: 'SecurePass1!',
    firstName: 'Jane',
    lastName: 'Doe',
    documentType: PatientDocumentTypeEnum.DNI,
    documentNumber: '12345678',
    birthDate: '1990-01-01',
    phone: '+1234567890',
    ...overrides,
  };
}

function makePrismaP2002Error(): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: '6.0.0',
  });
}

function makeAuthService() {
  const mockPrisma = {
    user: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    patient: {
      findFirst: jest.fn(),
    },
    role: {
      upsert: jest.fn(),
      findUniqueOrThrow: jest.fn(),
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

// ---------- getOrCreatePatientRole (via registerPatient) ----------

describe('AuthService.getOrCreatePatientRole', () => {
  it('(g) happy path: upsert succeeds, returns role', async () => {
    const { service, mockPrisma } = makeAuthService();
    const role = makeRole();

    mockPrisma.role.upsert.mockResolvedValue(role);

    // Access the private method via bracket notation for direct unit testing
    const result = await (service as any).getOrCreatePatientRole();

    expect(mockPrisma.role.upsert).toHaveBeenCalledWith({
      where: { code: ROLE_PATIENT },
      create: { code: ROLE_PATIENT, name: 'Patient' },
      update: {},
    });
    expect(result).toEqual(role);
    expect(mockPrisma.role.findUniqueOrThrow).not.toHaveBeenCalled();
  });

  it('(h) P2002 race: upsert throws P2002 → fallback to findUniqueOrThrow', async () => {
    const { service, mockPrisma } = makeAuthService();
    const role = makeRole();

    mockPrisma.role.upsert.mockRejectedValue(makePrismaP2002Error());
    mockPrisma.role.findUniqueOrThrow.mockResolvedValue(role);

    const result = await (service as any).getOrCreatePatientRole();

    expect(mockPrisma.role.upsert).toHaveBeenCalledTimes(1);
    expect(mockPrisma.role.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { code: ROLE_PATIENT },
    });
    expect(result).toEqual(role);
  });

  it('(i) non-P2002 error in upsert propagates without fallback', async () => {
    const { service, mockPrisma } = makeAuthService();
    const dbError = new Error('Connection refused');

    mockPrisma.role.upsert.mockRejectedValue(dbError);

    await expect((service as any).getOrCreatePatientRole()).rejects.toThrow('Connection refused');
    expect(mockPrisma.role.findUniqueOrThrow).not.toHaveBeenCalled();
  });
});

// ---------- registerPatient ----------

describe('AuthService.registerPatient', () => {
  function setupRegisterMocks(mockPrisma: any, role: ReturnType<typeof makeRole>) {
    // Pre-transaction checks: no existing user or patient
    mockPrisma.user.findFirst
      .mockResolvedValueOnce(null)  // existingUser check
      .mockResolvedValueOnce({      // buildAuthResponse user lookup
        id: 'user-1',
        email: 'new@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        status: 'ACTIVE',
        deletedAt: null,
        patientProfile: { id: 'patient-1' },
      });

    mockPrisma.patient.findFirst.mockResolvedValue(null);

    // getOrCreatePatientRole (called BEFORE $transaction)
    mockPrisma.role.upsert.mockResolvedValue(role);

    // $transaction: execute callback with a tx mock
    const txMock = {
      user: { create: jest.fn().mockResolvedValue({ id: 'user-1', email: 'new@example.com' }) },
      userRole: { create: jest.fn().mockResolvedValue({}) },
      patient: { create: jest.fn().mockResolvedValue({}) },
    };
    mockPrisma.$transaction.mockImplementation(async (cb: (tx: any) => Promise<any>) => cb(txMock));

    // buildAuthResponse internals
    mockPrisma.refreshToken.create.mockResolvedValue({});
  }

  it('(j) happy path: registers user and returns auth response', async () => {
    const { service, mockPrisma } = makeAuthService();
    const role = makeRole();
    setupRegisterMocks(mockPrisma, role);

    // getUserRoles called inside buildAuthResponse
    const mockUserRole = jest.fn().mockResolvedValue([{ role: { code: ROLE_PATIENT } }]);
    mockPrisma.userRole = { findMany: mockUserRole };

    const jwtSpy = jest.spyOn(service['jwtService'], 'signAsync').mockResolvedValue('access-token' as any);

    const dto = makeRegisterDto();
    const result = await service.registerPatient(dto);

    // getOrCreatePatientRole ran BEFORE the transaction
    expect(mockPrisma.role.upsert).toHaveBeenCalledTimes(1);
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    expect(result).toHaveProperty('accessToken', 'access-token');
    expect(result).toHaveProperty('refreshToken');

    jwtSpy.mockRestore();
  });

  it('(k) email already taken: throws ConflictException before touching roles', async () => {
    const { service, mockPrisma } = makeAuthService();
    mockPrisma.user.findFirst.mockResolvedValue(makeUser());

    const dto = makeRegisterDto();
    await expect(service.registerPatient(dto)).rejects.toThrow(ConflictException);

    expect(mockPrisma.role.upsert).not.toHaveBeenCalled();
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it('(l) concurrent registration (P2002 on role upsert): falls back, registration succeeds', async () => {
    const { service, mockPrisma } = makeAuthService();
    const role = makeRole();

    // Pre-transaction checks pass
    mockPrisma.user.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'user-1',
        email: 'new@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        status: 'ACTIVE',
        deletedAt: null,
        patientProfile: { id: 'patient-1' },
      });
    mockPrisma.patient.findFirst.mockResolvedValue(null);

    // getOrCreatePatientRole: upsert loses race → P2002 → findUniqueOrThrow returns role
    mockPrisma.role.upsert.mockRejectedValue(makePrismaP2002Error());
    mockPrisma.role.findUniqueOrThrow.mockResolvedValue(role);

    const txMock = {
      user: { create: jest.fn().mockResolvedValue({ id: 'user-1', email: 'new@example.com' }) },
      userRole: { create: jest.fn().mockResolvedValue({}) },
      patient: { create: jest.fn().mockResolvedValue({}) },
    };
    mockPrisma.$transaction.mockImplementation(async (cb: (tx: any) => Promise<any>) => cb(txMock));
    mockPrisma.refreshToken.create.mockResolvedValue({});

    const mockUserRole = jest.fn().mockResolvedValue([{ role: { code: ROLE_PATIENT } }]);
    mockPrisma.userRole = { findMany: mockUserRole };

    const jwtSpy = jest.spyOn(service['jwtService'], 'signAsync').mockResolvedValue('access-token' as any);

    const dto = makeRegisterDto();
    // Must NOT throw — the P2002 race is handled gracefully
    const result = await service.registerPatient(dto);

    expect(mockPrisma.role.findUniqueOrThrow).toHaveBeenCalledWith({ where: { code: ROLE_PATIENT } });
    expect(result).toHaveProperty('accessToken', 'access-token');

    jwtSpy.mockRestore();
  });
});
