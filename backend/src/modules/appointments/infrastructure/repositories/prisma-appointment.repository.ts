import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../shared/prisma/prisma.service";
import type { AppointmentRepository } from "../../application/ports/appointment.repository";
import { Appointment } from "../../domain/entities/appointment.entity";
import { AppointmentPrismaMapper } from "../mappers/appointment-prisma.mapper";

@Injectable()
export class PrismaAppointmentRepository implements AppointmentRepository {
    constructor(private readonly prisma: PrismaService) {}

    async save(appointment: Appointment): Promise<void> {
        const data = AppointmentPrismaMapper.toPersistence(appointment);
        await this.prisma.appointment.create({ data });
    }

    async findById(id: string): Promise<Appointment | null> {
        const raw = await this.prisma.appointment.findFirst({ where: { id } });
        return raw ? AppointmentPrismaMapper.toDomain(raw) : null;
    }

    async update(appointment: Appointment): Promise<void> {
        const data = AppointmentPrismaMapper.toPersistence(appointment);
        await this.prisma.appointment.update({
            where: { id: data.id },
            data: {
                startsAt: data.startsAt,
                endsAt: data.endsAt,
                status: data.status,
                reason: data.reason,
                facilityName: data.facilityName,
                facilityAddress: data.facilityAddress,
                doctorName: data.doctorName,
                specialty: data.specialty,
                wasAttended: data.wasAttended,
                diagnosis: data.diagnosis,
                conclusion: data.conclusion,
                followUpNotes: data.followUpNotes,
                cancelledReason: data.cancelledReason,
                updatedAt: new Date(),
            },
        });
    }
}

