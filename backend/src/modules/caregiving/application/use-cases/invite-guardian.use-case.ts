import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomBytes } from "crypto";
import { PrismaService } from "../../../../shared/prisma/prisma.service";
import { InviteGuardianCommand } from "../commands/invite-guardian.command";
import { ActorContext } from "../ports/actor-context";
import type { PatientGuardianRepository } from "../ports/patient-guardian.repository";
import {
    CannotInviteSelfAsGuardianError,
    GuardianLinkAlreadyActiveError,
    TargetUserHasNoPatientProfileError,
} from "../../domain/errors/caregiving-domain.errors";

type InvitationResult = {
    guardianLinkId: string;
    invitationToken: string;
    invitationExpiresAt: Date;
    targetPatientId: string;
};

@Injectable()
export class InviteGuardianUseCase {
    constructor(
        @Inject('PatientGuardianRepository')
        private readonly repository: PatientGuardianRepository,
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {}

    async execute(command: InviteGuardianCommand, actor: ActorContext): Promise<InvitationResult> {
        const normalizedEmail = command.targetPatientEmail.trim().toLowerCase();

        const targetUser = await this.prisma.user.findFirst({
            where: { email: normalizedEmail, deletedAt: null },
            include: { patientProfile: true },
        });

        if (!targetUser) {
            throw new NotFoundException('Target user not found');
        }

        if (!targetUser.patientProfile) {
            throw new ConflictException(new TargetUserHasNoPatientProfileError().message);
        }

        if (targetUser.id === actor.userId) {
            throw new ForbiddenException(new CannotInviteSelfAsGuardianError().message);
        }

        const ttlDays = Number(this.configService.get<string>('GUARDIAN_INVITATION_TTL_DAYS') ?? 7);
        const invitationToken = randomBytes(24).toString('hex');
        const invitationExpiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

        const existing = await this.repository.findAnyByPatientAndGuardian(
            targetUser.patientProfile.id,
            actor.userId,
        );

        if (existing?.isActive) {
            throw new ConflictException(new GuardianLinkAlreadyActiveError().message);
        }

        const saved = existing
            ? await this.repository.refreshInvitation({
                id: existing.id,
                createdByUserId: actor.userId,
                relationship: command.relationship?.trim() || undefined,
                canEditProfile: command.canEditProfile ?? true,
                canManageAppointments: command.canManageAppointments ?? true,
                invitationToken,
                invitationExpiresAt,
            })
            : await this.repository.createInvitation({
                patientId: targetUser.patientProfile.id,
                guardianUserId: actor.userId,
                createdByUserId: actor.userId,
                relationship: command.relationship?.trim() || undefined,
                canEditProfile: command.canEditProfile ?? true,
                canManageAppointments: command.canManageAppointments ?? true,
                invitationToken,
                invitationExpiresAt,
            });

        return {
            guardianLinkId: saved.id,
            invitationToken: saved.invitationToken!,
            invitationExpiresAt: saved.invitationExpiresAt!,
            targetPatientId: targetUser.patientProfile.id,
        };
    }
}
