import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CompleteAppointmentCommand } from "../commands/complete-appointment.command";
import { ActorContext } from "../ports/actor-context";
import type { AppointmentRepository } from "../ports/appointment.repository";
import type { AppointmentAccessService } from "../ports/appointment-access.service";
import { CreateEntriesFromAppointmentUseCase } from "../../../medical-history/application/use-cases/create-entries-from-appointment.use-case";

@Injectable()
export class CompleteAppointmentUseCase {
    constructor(
        @Inject('AppointmentRepository')
        private readonly appointmentRepository: AppointmentRepository,
        @Inject('AppointmentAccessService')
        private readonly appointmentAccessService: AppointmentAccessService,
        private readonly createEntriesFromAppointment: CreateEntriesFromAppointmentUseCase,
    ) {}

    async execute(command: CompleteAppointmentCommand, actor: ActorContext) {
        await this.appointmentAccessService.ensureCanManageAppointment(actor, command.id);

        const appointment = await this.appointmentRepository.findById(command.id);
        if (!appointment) throw new NotFoundException('Appointment not found');

        appointment.complete({
            endsAt: command.endsAt,
            wasAttended: command.wasAttended,
            diagnosis: command.diagnosis,
            conclusion: command.conclusion,
            followUpNotes: command.followUpNotes,
        });

        await this.appointmentRepository.update(appointment);

        await this.createEntriesFromAppointment.execute({
            id: appointment.id,
            patientId: appointment.patientId,
            startsAt: appointment.startsAt,
            endsAt: appointment.endsAt,
            diagnosis: appointment.diagnosis,
            conclusion: appointment.conclusion,
            followUpNotes: appointment.followUpNotes,
        }, actor.userId);

        return { id: appointment.id };
    }
}

