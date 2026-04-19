import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ActorContext } from "../ports/actor-context";
import type { AppointmentRepository } from "../ports/appointment.repository";
import type { AppointmentAccessService } from "../ports/appointment-access.service";

@Injectable()
export class GetAppointmentByIdUseCase {
    constructor(
        @Inject('AppointmentRepository')
        private readonly appointmentRepository: AppointmentRepository,
        @Inject('AppointmentAccessService')
        private readonly appointmentAccessService: AppointmentAccessService,
    ) {}

    async execute(id: string, actor: ActorContext) {
        await this.appointmentAccessService.ensureCanReadAppointment(actor, id);

        const appointment = await this.appointmentRepository.findById(id);
        if (!appointment) throw new NotFoundException('Appointment not found');
        return appointment;
    }
}

