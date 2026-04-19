import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { CreateAppointmentCommand } from "../commands/create-appointment.command";
import { ActorContext } from "../ports/actor-context";
import type { AppointmentRepository } from "../ports/appointment.repository";
import type { AppointmentAccessService } from "../ports/appointment-access.service";
import { Appointment } from "../../domain/entities/appointment.entity";

@Injectable()
export class CreateAppointmentUseCase {
    constructor(
        @Inject('AppointmentRepository')
        private readonly appointmentRepository: AppointmentRepository,
        @Inject('AppointmentAccessService')
        private readonly appointmentAccessService: AppointmentAccessService,
    ) {}

    async execute(command: CreateAppointmentCommand, actor: ActorContext) {
        await this.appointmentAccessService.ensureCanManagePatient(actor, command.patientId);

        const appointment = Appointment.create({
            id: randomUUID(),
            patientId: command.patientId,
            recordedByUserId: actor.userId,
            startsAt: command.startsAt,
            endsAt: command.endsAt,
            reason: command.reason,
            facilityName: command.facilityName,
            facilityAddress: command.facilityAddress,
            doctorName: command.doctorName,
            specialty: command.specialty,
        });

        await this.appointmentRepository.save(appointment);
        return { id: appointment.id };
    }
}

