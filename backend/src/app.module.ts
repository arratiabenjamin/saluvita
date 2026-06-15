import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './shared/prisma/prisma.module';
import { PatientsModule } from './modules/patients/patients.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { StorageModule } from './modules/storage/storage.module';
import { CaregivingModule } from './modules/caregiving/caregiving.module';
import { MedicalHistoryModule } from './modules/medical-history/medical-history.module';
import { TestSupportModule } from './modules/test-support/test-support.module';

const devOnlyModules = process.env.NODE_ENV !== 'production' ? [TestSupportModule] : [];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    StorageModule,
    AuthModule,
    UsersModule,
    PatientsModule,
    CaregivingModule,
    MedicalHistoryModule,
    AppointmentsModule,
    RemindersModule,
    SchedulesModule,
    DashboardModule,
    ...devOnlyModules,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
