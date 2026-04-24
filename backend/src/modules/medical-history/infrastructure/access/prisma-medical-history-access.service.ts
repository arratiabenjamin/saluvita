import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../shared/prisma/prisma.service";
import type { MedicalHistoryAccessService } from "../../application/ports/medical-history-access.service";
import type { ActorContext } from "../../application/ports/actor-context";
import { ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT } from "../../../../shared/auth/roles.constants";

@Injectable()
export class PrismaMedicalHistoryAccessService implements MedicalHistoryAccessService {
    constructor(private readonly prisma: PrismaService) {}

    async ensureCanReadPatientHistory(actor: ActorContext, patientId: string): Promise<void> {
        if (actor.roles.includes(ROLE_ADMIN)) return;

        if (actor.roles.includes(ROLE_PATIENT) && actor.patientId === patientId) return;

        if (actor.roles.includes(ROLE_CAREGIVER)) {
            const link = await this.prisma.patientGuardian.findFirst({
                where: {
                    patientId,
                    guardianUserId: actor.userId,
                    isActive: true,
                    patient: { deletedAt: null, isActive: true },
                },
            });
            if (link) return;
        }

        throw new ForbiddenException('No read access to this patient history');
    }

    async ensureCanWritePatientHistory(actor: ActorContext, patientId: string): Promise<void> {
        if (actor.roles.includes(ROLE_ADMIN)) return;

        if (actor.roles.includes(ROLE_PATIENT) && actor.patientId === patientId) return;

        if (actor.roles.includes(ROLE_CAREGIVER)) {
            const link = await this.prisma.patientGuardian.findFirst({
                where: {
                    patientId,
                    guardianUserId: actor.userId,
                    isActive: true,
                    canEditProfile: true,
                    patient: { deletedAt: null, isActive: true },
                },
            });
            if (link) return;
        }

        throw new ForbiddenException('No write access to this patient history');
    }
}
