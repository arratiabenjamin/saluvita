import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ActorContext } from "../ports/actor-context";
import type { PatientGuardianRepository } from "../ports/patient-guardian.repository";

@Injectable()
export class RejectGuardianInvitationUseCase {
    constructor(
        @Inject('PatientGuardianRepository')
        private readonly repository: PatientGuardianRepository,
    ) {}

    async execute(token: string, actor: ActorContext): Promise<{ guardianLinkId: string }> {
        const invitation = await this.repository.findByInvitationToken(token);
        if (!invitation || !invitation.isPending()) {
            throw new NotFoundException('Invitation not found or already processed');
        }

        if (!actor.patientId || actor.patientId !== invitation.patientId) {
            throw new ForbiddenException('Only the target patient can reject this invitation');
        }

        const rejected = await this.repository.rejectInvitation(invitation.id);
        return { guardianLinkId: rejected.id };
    }
}
