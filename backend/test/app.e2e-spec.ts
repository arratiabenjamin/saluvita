import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/healthz (GET) → returns ok: true', async () => {
    return request(app.getHttpServer())
      .get('/api/healthz')
      .expect(200)
      .expect({ ok: true });
  });

  it('/api/db-health (GET) → returns ok: true with database: connected', async () => {
    return request(app.getHttpServer())
      .get('/api/db-health')
      .expect(200)
      .expect({ ok: true, database: 'connected' });
  });

  it('/api/v1/auth/test/last-reset-link (GET) → 404 when no link captured yet', async () => {
    return request(app.getHttpServer())
      .get('/api/v1/auth/test/last-reset-link')
      .expect(404);
  });
});
