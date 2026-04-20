import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { DashboardService } from './infrastructure/dashboard.service';
import { GetDashboardOverviewController } from './presentation/controllers/get-dashboard-overview.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [DashboardService],
  controllers: [GetDashboardOverviewController],
})
export class DashboardModule {}
