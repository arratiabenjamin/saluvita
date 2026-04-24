import { Module } from "@nestjs/common";
import { PrismaModule } from "../../shared/prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";
import { MedicalHistoryModule } from "../medical-history/medical-history.module";
import { CreateAppointmentController } from "./presentation/controllers/create-appointment.controller";
import { GetAppointmentByIdController } from "./presentation/controllers/get-appointment-by-id.controller";
import { ListAppointmentsController } from "./presentation/controllers/list-appointments.controller";
import { UpdateAppointmentController } from "./presentation/controllers/update-appointment.controller";
import { CompleteAppointmentController } from "./presentation/controllers/complete-appointment.controller";
import { CancelAppointmentController } from "./presentation/controllers/cancel-appointment.controller";
import { CreateAppointmentUseCase } from "./application/use-cases/create-appointment.use-case";
import { GetAppointmentByIdUseCase } from "./application/use-cases/get-appointment-by-id.use-case";
import { ListAppointmentsUseCase } from "./application/use-cases/list-appointments.use-case";
import { UpdateAppointmentUseCase } from "./application/use-cases/update-appointment.use-case";
import { CompleteAppointmentUseCase } from "./application/use-cases/complete-appointment.use-case";
import { CancelAppointmentUseCase } from "./application/use-cases/cancel-appointment.use-case";
import { PrismaAppointmentRepository } from "./infrastructure/repositories/prisma-appointment.repository";
import { PrismaAppointmentQueryService } from "./infrastructure/queries/prisma-appointment.query-service";
import { PrismaAppointmentAccessService } from "./infrastructure/access/prisma-appointment-access.service";

@Module({
    imports: [PrismaModule, AuthModule, MedicalHistoryModule],
    controllers: [
        CreateAppointmentController,
        GetAppointmentByIdController,
        ListAppointmentsController,
        UpdateAppointmentController,
        CompleteAppointmentController,
        CancelAppointmentController,
    ],
    providers: [
        { provide: 'AppointmentRepository', useClass: PrismaAppointmentRepository },
        { provide: 'AppointmentQueryService', useClass: PrismaAppointmentQueryService },
        { provide: 'AppointmentAccessService', useClass: PrismaAppointmentAccessService },
        PrismaAppointmentRepository,
        PrismaAppointmentQueryService,
        PrismaAppointmentAccessService,
        CreateAppointmentUseCase,
        GetAppointmentByIdUseCase,
        ListAppointmentsUseCase,
        UpdateAppointmentUseCase,
        CompleteAppointmentUseCase,
        CancelAppointmentUseCase,
    ],
})
export class AppointmentsModule {}

