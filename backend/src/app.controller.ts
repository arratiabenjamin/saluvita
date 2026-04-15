import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './shared/prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async dbHealth() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { ok: true, database: 'connected' };
  }
}
