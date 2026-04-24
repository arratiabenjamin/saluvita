import { Inject, Injectable } from "@nestjs/common";
import { ActorContext } from "../ports/actor-context";
import type { InvitationSummary, PatientGuardianQueryService } from "../ports/patient-guardian-query.service";

@Injectable()
export class ListOutgoingInvitationsUseCase {
    constructor(
        @Inject('PatientGuardianQueryService')
        private readonly queryService: PatientGuardianQueryService,
    ) {}

    async execute(actor: ActorContext): Promise<{ data: InvitationSummary[] }> {
        const data = await this.queryService.listPendingOutgoingByGuardian(actor.userId);
        return { data };
    }
}
