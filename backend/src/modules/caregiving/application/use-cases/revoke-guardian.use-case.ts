import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ActorContext } from "../ports/actor-context";
import type { PatientGuardianRepository } from "../ports/patient-guardian.repository";
import { ROLE_ADMIN } from "../../../../shared/auth/roles.constants";

@Injectable()
export class RevokeGuardianUseCase {
    constructor(
        @Inject('PatientGuardianRepository')
        private readonly repository: PatientGuardianRepository,
    ) {}

    async execute(guardianLinkId: string, actor: ActorContext): Promise<{ guardianLinkId: string }> {
        const link = await this.repository.findById(guardianLinkId);
        if (!link) throw new NotFoundException('Guardian link not found');

        const isAdmin = actor.roles.includes(ROLE_ADMIN);
        const isPatientOwner = actor.patientId === link.patientId;
        const isGuardian = actor.userId === link.guardianUserId;

        if (!isAdmin && !isPatientOwner && !isGuardian) {
            throw new ForbiddenException('You cannot revoke this guardian link');
        }

        const revoked = await this.repository.revoke(link.id);
        return { guardianLinkId: revoked.id };
    }
}
