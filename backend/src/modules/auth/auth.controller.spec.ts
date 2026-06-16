import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, CanActivate, ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../shared/auth/guards/jwt-auth.guard';

const GENERIC_MESSAGE = 'If that email is registered, a reset link is on its way.';

function makeAuthServiceMock(): Partial<AuthService> {
  return {
    forgotPassword: jest.fn().mockResolvedValue({ message: GENERIC_MESSAGE }),
    resetPassword: jest.fn().mockResolvedValue(undefined),
  };
}

class NoopGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    return true;
  }
}

async function buildApp(authServiceMock: Partial<AuthService>): Promise<INestApplication> {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [AuthController],
    providers: [
      { provide: AuthService, useValue: authServiceMock },
    ],
  })
    .overrideGuard(JwtAuthGuard)
    .useClass(NoopGuard)
    .compile();

  const app = module.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();
  return app;
}

// ---------- POST /v1/auth/forgot-password ----------

describe('POST /v1/auth/forgot-password', () => {
  let app: INestApplication;
  let authServiceMock: Partial<AuthService>;

  beforeEach(async () => {
    authServiceMock = makeAuthServiceMock();
    app = await buildApp(authServiceMock);
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns 200 for existing user email', async () => {
    await request(app.getHttpServer())
      .post('/v1/auth/forgot-password')
      .send({ email: 'existing@example.com' })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.message).toBe(GENERIC_MESSAGE);
      });

    expect(authServiceMock.forgotPassword).toHaveBeenCalledWith('existing@example.com');
  });

  it('returns 200 even for non-existing user (anti-enumeration)', async () => {
    (authServiceMock.forgotPassword as jest.Mock).mockResolvedValue({ message: GENERIC_MESSAGE });

    await request(app.getHttpServer())
      .post('/v1/auth/forgot-password')
      .send({ email: 'unknown@example.com' })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.message).toBe(GENERIC_MESSAGE);
      });
  });

  it('returns 400 for malformed email', async () => {
    await request(app.getHttpServer())
      .post('/v1/auth/forgot-password')
      .send({ email: 'not-an-email' })
      .expect(400);

    expect(authServiceMock.forgotPassword).not.toHaveBeenCalled();
  });
});

// ---------- POST /v1/auth/reset-password ----------

describe('POST /v1/auth/reset-password', () => {
  let app: INestApplication;
  let authServiceMock: Partial<AuthService>;

  beforeEach(async () => {
    authServiceMock = makeAuthServiceMock();
    app = await buildApp(authServiceMock);
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns 200 for valid token and strong password', async () => {
    await request(app.getHttpServer())
      .post('/v1/auth/reset-password')
      .send({ token: 'validtoken123', password: 'NewPass123!' })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.ok).toBe(true);
      });
  });

  it('returns 400 for invalid/expired/used token (service throws BadRequestException)', async () => {
    (authServiceMock.resetPassword as jest.Mock).mockRejectedValue(
      new BadRequestException('Invalid, expired, or already used reset token.'),
    );

    await request(app.getHttpServer())
      .post('/v1/auth/reset-password')
      .send({ token: 'badtoken', password: 'NewPass123!' })
      .expect(400);
  });

  it('returns 400 when token field is missing', async () => {
    await request(app.getHttpServer())
      .post('/v1/auth/reset-password')
      .send({ password: 'NewPass123!' })
      .expect(400);

    expect(authServiceMock.resetPassword).not.toHaveBeenCalled();
  });

  it('returns 400 for weak password (missing special character)', async () => {
    await request(app.getHttpServer())
      .post('/v1/auth/reset-password')
      .send({ token: 'validtoken123', password: 'Weakpass1' })
      .expect(400);

    expect(authServiceMock.resetPassword).not.toHaveBeenCalled();
  });

  it('returns 400 for weak password (too short)', async () => {
    await request(app.getHttpServer())
      .post('/v1/auth/reset-password')
      .send({ token: 'validtoken123', password: 'Ab1!' })
      .expect(400);

    expect(authServiceMock.resetPassword).not.toHaveBeenCalled();
  });

  it('returns 400 for weak password (no uppercase)', async () => {
    await request(app.getHttpServer())
      .post('/v1/auth/reset-password')
      .send({ token: 'validtoken123', password: 'newpass123!' })
      .expect(400);

    expect(authServiceMock.resetPassword).not.toHaveBeenCalled();
  });
});
