import { Inject, Injectable } from "@nestjs/common";
import { ListAppointmentsQuery } from "../queries/list-appointments.query";
import { ActorContext } from "../ports/actor-context";
import type { AppointmentQueryService } from "../ports/appointment-query.service";
import type { AppointmentAccessService } from "../ports/appointment-access.service";

@Injectable()
export class ListAppointmentsUseCase {
    constructor(
        @Inject('AppointmentQueryService')
        private readonly appointmentQueryService: AppointmentQueryService,
        @Inject('AppointmentAccessService')
        private readonly appointmentAccessService: AppointmentAccessService,
    ) {}

    async execute(query: ListAppointmentsQuery, actor: ActorContext) {
        const scope = await this.appointmentAccessService.resolveListScope(actor);
        return this.appointmentQueryService.listPaginated(query, scope);
    }
}

