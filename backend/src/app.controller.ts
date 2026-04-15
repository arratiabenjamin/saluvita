import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './shared/prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('healthz')
  healthz() {
    return { ok: true };
  }

  @Get('db-health')
  async dbHealth() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { ok: true, database: 'connected' };
  }
}
