import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { GetSchedulesOverviewController } from './presentation/controllers/get-schedules-overview.controller';
import { SchedulesService } from './infrastructure/schedules.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [GetSchedulesOverviewController],
  providers: [SchedulesService],
})
export class SchedulesModule {}
