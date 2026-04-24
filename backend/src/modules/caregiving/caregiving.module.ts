import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "../../shared/prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";

import { CreateDependentController } from "./presentation/controllers/create-dependent.controller";
import { ListDependentsController } from "./presentation/controllers/list-dependents.controller";
import { InviteGuardianController } from "./presentation/controllers/invite-guardian.controller";
import { ListIncomingInvitationsController } from "./presentation/controllers/list-incoming-invitations.controller";
import { AcceptInvitationController } from "./presentation/controllers/accept-invitation.controller";
import { RejectInvitationController } from "./presentation/controllers/reject-invitation.controller";
import { ListMyGuardiansController } from "./presentation/controllers/list-my-guardians.controller";
import { UpdateGuardianController } from "./presentation/controllers/update-guardian.controller";
import { RevokeGuardianController } from "./presentation/controllers/revoke-guardian.controller";

import { CreateDependentUseCase } from "./application/use-cases/create-dependent.use-case";
import { InviteGuardianUseCase } from "./application/use-cases/invite-guardian.use-case";
import { AcceptGuardianInvitationUseCase } from "./application/use-cases/accept-guardian-invitation.use-case";
import { RejectGuardianInvitationUseCase } from "./application/use-cases/reject-guardian-invitation.use-case";
import { ListDependentsUseCase } from "./application/use-cases/list-dependents.use-case";
import { ListMyGuardiansUseCase } from "./application/use-cases/list-my-guardians.use-case";
import { ListIncomingInvitationsUseCase } from "./application/use-cases/list-incoming-invitations.use-case";
import { ListOutgoingInvitationsUseCase } from "./application/use-cases/list-outgoing-invitations.use-case";
import { UpdateGuardianPermissionsUseCase } from "./application/use-cases/update-guardian-permissions.use-case";
import { RevokeGuardianUseCase } from "./application/use-cases/revoke-guardian.use-case";

import { PrismaPatientGuardianRepository } from "./infrastructure/repositories/prisma-patient-guardian.repository";
import { PrismaPatientGuardianQueryService } from "./infrastructure/queries/prisma-patient-guardian.query-service";

@Module({
    imports: [ConfigModule, PrismaModule, AuthModule],
    controllers: [
        CreateDependentController,
        ListDependentsController,
        InviteGuardianController,
        ListIncomingInvitationsController,
        AcceptInvitationController,
        RejectInvitationController,
        ListMyGuardiansController,
        UpdateGuardianController,
        RevokeGuardianController,
    ],
    providers: [
        { provide: 'PatientGuardianRepository', useClass: PrismaPatientGuardianRepository },
        { provide: 'PatientGuardianQueryService', useClass: PrismaPatientGuardianQueryService },
        PrismaPatientGuardianRepository,
        PrismaPatientGuardianQueryService,
        CreateDependentUseCase,
        InviteGuardianUseCase,
        AcceptGuardianInvitationUseCase,
        RejectGuardianInvitationUseCase,
        ListDependentsUseCase,
        ListMyGuardiansUseCase,
        ListIncomingInvitationsUseCase,
        ListOutgoingInvitationsUseCase,
        UpdateGuardianPermissionsUseCase,
        RevokeGuardianUseCase,
    ],
    exports: [
        'PatientGuardianRepository',
    ],
})
export class CaregivingModule {}
