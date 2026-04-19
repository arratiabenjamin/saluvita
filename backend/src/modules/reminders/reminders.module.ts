import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { CreateReminderController } from './presentation/controllers/create-reminder.controller';
import { GetReminderByIdController } from './presentation/controllers/get-reminder-by-id.controller';
import { ListRemindersController } from './presentation/controllers/list-reminders.controller';
import { UpdateReminderController } from './presentation/controllers/update-reminder.controller';
import { ActivateReminderController } from './presentation/controllers/activate-reminder.controller';
import { DeactivateReminderController } from './presentation/controllers/deactivate-reminder.controller';
import { UpsertReminderLogController } from './presentation/controllers/upsert-reminder-log.controller';
import { PrismaReminderRepository } from './infrastructure/repositories/prisma-reminder.repository';
import { PrismaReminderQueryService } from './infrastructure/queries/prisma-reminder.query-service';
import { PrismaReminderAccessService } from './infrastructure/access/prisma-reminder-access.service';
import { CreateReminderUseCase } from './application/use-cases/create-reminder.use-case';
import { GetReminderByIdUseCase } from './application/use-cases/get-reminder-by-id.use-case';
import { ListRemindersUseCase } from './application/use-cases/list-reminders.use-case';
import { UpdateReminderUseCase } from './application/use-cases/update-reminder.use-case';
import { ActivateReminderUseCase } from './application/use-cases/activate-reminder.use-case';
import { DeactivateReminderUseCase } from './application/use-cases/deactivate-reminder.use-case';
import { UpsertReminderLogUseCase } from './application/use-cases/upsert-reminder-log.use-case';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [
    CreateReminderController,
    GetReminderByIdController,
    ListRemindersController,
    UpdateReminderController,
    ActivateReminderController,
    DeactivateReminderController,
    UpsertReminderLogController,
  ],
  providers: [
    { provide: 'ReminderRepository', useClass: PrismaReminderRepository },
    { provide: 'ReminderQueryService', useClass: PrismaReminderQueryService },
    { provide: 'ReminderAccessService', useClass: PrismaReminderAccessService },
    PrismaReminderRepository,
    PrismaReminderQueryService,
    PrismaReminderAccessService,
    CreateReminderUseCase,
    GetReminderByIdUseCase,
    ListRemindersUseCase,
    UpdateReminderUseCase,
    ActivateReminderUseCase,
    DeactivateReminderUseCase,
    UpsertReminderLogUseCase,
  ],
  exports: [PrismaReminderAccessService],
})
export class RemindersModule {}
