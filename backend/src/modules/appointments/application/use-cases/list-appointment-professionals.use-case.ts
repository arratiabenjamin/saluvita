import { Inject, Injectable } from "@nestjs/common";
import { ListAppointmentProfessionalsQuery } from "../queries/list-appointment-professionals.query";
import { ActorContext } from "../ports/actor-context";
import type { AppointmentQueryService } from "../ports/appointment-query.service";
import type { AppointmentAccessService } from "../ports/appointment-access.service";

@Injectable()
export class ListAppointmentProfessionalsUseCase {
    constructor(
        @Inject('AppointmentQueryService')
        private readonly appointmentQueryService: AppointmentQueryService,
        @Inject('AppointmentAccessService')
        private readonly appointmentAccessService: AppointmentAccessService,
    ) {}

    async execute(query: ListAppointmentProfessionalsQuery, actor: ActorContext) {
        const scope = await this.appointmentAccessService.resolveListScope(actor);
        return this.appointmentQueryService.listProfessionals(query, scope);
    }
}
