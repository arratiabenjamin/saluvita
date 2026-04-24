import { Inject, Injectable } from "@nestjs/common";
import { ActorContext } from "../ports/actor-context";
import type { DependentSummary, PatientGuardianQueryService } from "../ports/patient-guardian-query.service";

@Injectable()
export class ListDependentsUseCase {
    constructor(
        @Inject('PatientGuardianQueryService')
        private readonly queryService: PatientGuardianQueryService,
    ) {}

    async execute(actor: ActorContext): Promise<{ data: DependentSummary[] }> {
        const data = await this.queryService.listDependentsByGuardian(actor.userId);
        return { data };
    }
}
