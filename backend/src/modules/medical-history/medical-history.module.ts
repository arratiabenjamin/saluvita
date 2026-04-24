import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "../../shared/prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";
import { StorageModule } from "../storage/storage.module";

import { ListEntriesController } from "./presentation/controllers/list-entries.controller";
import { GetEntryController } from "./presentation/controllers/get-entry.controller";
import { CreateManualEntryController } from "./presentation/controllers/create-manual-entry.controller";
import { UpdateEntryController } from "./presentation/controllers/update-entry.controller";
import { DeleteEntryController } from "./presentation/controllers/delete-entry.controller";
import { RequestAttachmentUploadController } from "./presentation/controllers/request-attachment-upload.controller";
import { RegisterAttachmentController } from "./presentation/controllers/register-attachment.controller";
import { GetAttachmentDownloadUrlController } from "./presentation/controllers/get-attachment-download-url.controller";
import { DeleteAttachmentController } from "./presentation/controllers/delete-attachment.controller";

import { CreateManualEntryUseCase } from "./application/use-cases/create-manual-entry.use-case";
import { CreateEntriesFromAppointmentUseCase } from "./application/use-cases/create-entries-from-appointment.use-case";
import { ListEntriesUseCase } from "./application/use-cases/list-entries.use-case";
import { GetEntryUseCase } from "./application/use-cases/get-entry.use-case";
import { UpdateEntryUseCase } from "./application/use-cases/update-entry.use-case";
import { DeleteEntryUseCase } from "./application/use-cases/delete-entry.use-case";
import { RequestAttachmentUploadUseCase } from "./application/use-cases/request-attachment-upload.use-case";
import { RegisterAttachmentUseCase } from "./application/use-cases/register-attachment.use-case";
import { GetAttachmentDownloadUrlUseCase } from "./application/use-cases/get-attachment-download-url.use-case";
import { DeleteAttachmentUseCase } from "./application/use-cases/delete-attachment.use-case";

import { PrismaMedicalHistoryRepository } from "./infrastructure/repositories/prisma-medical-history.repository";
import { PrismaMedicalHistoryAccessService } from "./infrastructure/access/prisma-medical-history-access.service";

@Module({
    imports: [ConfigModule, PrismaModule, AuthModule, StorageModule],
    controllers: [
        ListEntriesController,
        GetEntryController,
        CreateManualEntryController,
        UpdateEntryController,
        DeleteEntryController,
        RequestAttachmentUploadController,
        RegisterAttachmentController,
        GetAttachmentDownloadUrlController,
        DeleteAttachmentController,
    ],
    providers: [
        { provide: 'MedicalHistoryRepository', useClass: PrismaMedicalHistoryRepository },
        { provide: 'MedicalHistoryAccessService', useClass: PrismaMedicalHistoryAccessService },
        PrismaMedicalHistoryRepository,
        PrismaMedicalHistoryAccessService,
        CreateManualEntryUseCase,
        CreateEntriesFromAppointmentUseCase,
        ListEntriesUseCase,
        GetEntryUseCase,
        UpdateEntryUseCase,
        DeleteEntryUseCase,
        RequestAttachmentUploadUseCase,
        RegisterAttachmentUseCase,
        GetAttachmentDownloadUrlUseCase,
        DeleteAttachmentUseCase,
    ],
    exports: [
        CreateEntriesFromAppointmentUseCase,
    ],
})
export class MedicalHistoryModule {}
