import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { ActorContext } from "../ports/actor-context";
import type { InvitationSummary, PatientGuardianQueryService } from "../ports/patient-guardian-query.service";

@Injectable()
export class ListIncomingInvitationsUseCase {
    constructor(
        @Inject('PatientGuardianQueryService')
        private readonly queryService: PatientGuardianQueryService,
    ) {}

    async execute(actor: ActorContext): Promise<{ data: InvitationSummary[] }> {
        if (!actor.patientId) {
            throw new ForbiddenException('Authenticated user has no patient profile');
        }
        const data = await this.queryService.listPendingIncomingForPatient(actor.patientId);
        return { data };
    }
}
