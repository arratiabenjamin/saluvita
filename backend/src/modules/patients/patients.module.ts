import { Module } from "@nestjs/common";
import { PrismaModule } from "../../shared/prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";
import { CreatePatientController } from "./presentation/controllers/create-patient.controller";
import { GetPatientByIdController } from "./presentation/controllers/get-patient-by-id.controller";
import { ListPatientsController } from "./presentation/controllers/list-patients.controller";
import { UpdatePatientController } from "./presentation/controllers/update-patient.controller";
import { PrismaPatientRepository } from "./infrastructure/repositories/prisma-patient.repository";
import { PrismaPatientQueryService } from './infrastructure/queries/prisma-patient.query-service';
import { CreatePatientUseCase } from "./application/use-cases/create-patient.use-case";
import { GetPatientByIdUseCase } from './application/use-cases/get-patient-by-id.use-case';
import { ListPatientsUseCase } from "./application/use-cases/list-patients.use-case";
import { UpdatePatientUseCase } from "./application/use-cases/update-patient.use-case";

@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [
        CreatePatientController,
        GetPatientByIdController,
        ListPatientsController,
        UpdatePatientController,
    ],
    providers: [
        // Registrar implementacion bajo token de string para desacoplar del framework y facilitar testing.
        { provide: 'PatientRepository', useClass: PrismaPatientRepository },
        { provide: 'PatientQueryService', useClass: PrismaPatientQueryService },
        PrismaPatientRepository,
        PrismaPatientQueryService,
        CreatePatientUseCase,
        GetPatientByIdUseCase,
        ListPatientsUseCase,
        UpdatePatientUseCase,
    ],
})
export class PatientsModule {}
