import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CancelAppointmentCommand } from "../commands/cancel-appointment.command";
import { ActorContext } from "../ports/actor-context";
import type { AppointmentRepository } from "../ports/appointment.repository";
import type { AppointmentAccessService } from "../ports/appointment-access.service";

@Injectable()
export class CancelAppointmentUseCase {
    constructor(
        @Inject('AppointmentRepository')
        private readonly appointmentRepository: AppointmentRepository,
        @Inject('AppointmentAccessService')
        private readonly appointmentAccessService: AppointmentAccessService,
    ) {}

    async execute(command: CancelAppointmentCommand, actor: ActorContext) {
        await this.appointmentAccessService.ensureCanManageAppointment(actor, command.id);

        const appointment = await this.appointmentRepository.findById(command.id);
        if (!appointment) throw new NotFoundException('Appointment not found');

        appointment.cancel(command.cancelledReason);
        await this.appointmentRepository.update(appointment);
        return { id: appointment.id };
    }
}

