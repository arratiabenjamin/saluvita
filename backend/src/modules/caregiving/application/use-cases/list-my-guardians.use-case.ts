import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { ActorContext } from "../ports/actor-context";
import type { GuardianSummary, PatientGuardianQueryService } from "../ports/patient-guardian-query.service";

@Injectable()
export class ListMyGuardiansUseCase {
    constructor(
        @Inject('PatientGuardianQueryService')
        private readonly queryService: PatientGuardianQueryService,
    ) {}

    async execute(actor: ActorContext): Promise<{ data: GuardianSummary[] }> {
        if (!actor.patientId) {
            throw new ForbiddenException('Authenticated user has no patient profile');
        }
        const data = await this.queryService.listGuardiansByPatient(actor.patientId);
        return { data };
    }
}
