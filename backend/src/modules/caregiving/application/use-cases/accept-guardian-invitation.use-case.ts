import { ForbiddenException, GoneException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../../shared/prisma/prisma.service";
import { ActorContext } from "../ports/actor-context";
import type { PatientGuardianRepository } from "../ports/patient-guardian.repository";
import { ROLE_CAREGIVER } from "../../../../shared/auth/roles.constants";

@Injectable()
export class AcceptGuardianInvitationUseCase {
    constructor(
        @Inject('PatientGuardianRepository')
        private readonly repository: PatientGuardianRepository,
        private readonly prisma: PrismaService,
    ) {}

    async execute(token: string, actor: ActorContext): Promise<{ guardianLinkId: string }> {
        const invitation = await this.repository.findByInvitationToken(token);
        if (!invitation || !invitation.isPending()) {
            throw new NotFoundException('Invitation not found or already processed');
        }
        if (invitation.isExpired()) {
            throw new GoneException('Invitation has expired');
        }

        if (!actor.patientId || actor.patientId !== invitation.patientId) {
            throw new ForbiddenException('Only the target patient can accept this invitation');
        }

        const accepted = await this.repository.acceptInvitation(invitation.id);
        await this.ensureCaregiverRole(invitation.guardianUserId);
        return { guardianLinkId: accepted.id };
    }

    private async ensureCaregiverRole(userId: string): Promise<void> {
        const role = await this.prisma.role.upsert({
            where: { code: ROLE_CAREGIVER as any },
            create: { code: ROLE_CAREGIVER as any, name: 'Caregiver' },
            update: {},
        });

        const existing = await this.prisma.userRole.findUnique({
            where: { userId_roleId: { userId, roleId: role.id } },
        });

        if (!existing) {
            await this.prisma.userRole.create({
                data: { userId, roleId: role.id },
            });
        }
    }
}
