import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UpdateAppointmentCommand } from "../commands/update-appointment.command";
import { ActorContext } from "../ports/actor-context";
import type { AppointmentRepository } from "../ports/appointment.repository";
import type { AppointmentAccessService } from "../ports/appointment-access.service";

@Injectable()
export class UpdateAppointmentUseCase {
    constructor(
        @Inject('AppointmentRepository')
        private readonly appointmentRepository: AppointmentRepository,
        @Inject('AppointmentAccessService')
        private readonly appointmentAccessService: AppointmentAccessService,
    ) {}

    async execute(command: UpdateAppointmentCommand, actor: ActorContext) {
        await this.appointmentAccessService.ensureCanManageAppointment(actor, command.id);

        const appointment = await this.appointmentRepository.findById(command.id);
        if (!appointment) throw new NotFoundException('Appointment not found');

        appointment.updateDetails({
            startsAt: command.startsAt,
            endsAt: command.endsAt,
            reason: command.reason,
            facilityName: command.facilityName,
            facilityAddress: command.facilityAddress,
            doctorName: command.doctorName,
            specialty: command.specialty,
        });

        await this.appointmentRepository.update(appointment);
        return { id: appointment.id };
    }
}

