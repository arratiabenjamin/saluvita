import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../../shared/prisma/prisma.service";
import type { AppointmentAccessService } from "../../application/ports/appointment-access.service";
import type { ActorContext } from "../../application/ports/actor-context";
import type { AppointmentListScope } from "../../application/ports/appointment-query.service";
import { ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT } from "../../../../shared/auth/roles.constants";

@Injectable()
export class PrismaAppointmentAccessService implements AppointmentAccessService {
    constructor(private readonly prisma: PrismaService) {}

    async ensureCanManagePatient(actor: ActorContext, patientId: string): Promise<void> {
        if (actor.roles.includes(ROLE_ADMIN)) return;

        if (actor.roles.includes(ROLE_PATIENT)) {
            if (!actor.patientId) throw new ForbiddenException('Authenticated patient has no patientId');
            if (actor.patientId !== patientId) {
                throw new ForbiddenException('You can only manage your own appointments');
            }
            return;
        }

        if (actor.roles.includes(ROLE_CAREGIVER)) {
            const link = await this.prisma.patientGuardian.findFirst({
                where: {
                    patientId,
                    guardianUserId: actor.userId,
                    isActive: true,
                    canManageAppointments: true,
                    patient: { deletedAt: null, isActive: true },
                },
            });
            if (!link) throw new ForbiddenException('No appointment permissions for this patient');
            return;
        }

        throw new ForbiddenException('Insufficient role permissions');
    }

    async ensureCanReadAppointment(actor: ActorContext, appointmentId: string): Promise<void> {
        const appointment = await this.prisma.appointment.findFirst({
            where: { id: appointmentId },
            select: { id: true, patientId: true },
        });
        if (!appointment) throw new NotFoundException('Appointment not found');

        await this.ensureCanManagePatient(actor, appointment.patientId);
    }

    async ensureCanManageAppointment(actor: ActorContext, appointmentId: string): Promise<void> {
        // En MVP usamos misma regla para leer y modificar.
        await this.ensureCanReadAppointment(actor, appointmentId);
    }

    async resolveListScope(actor: ActorContext): Promise<AppointmentListScope> {
        if (actor.roles.includes(ROLE_ADMIN)) return { mode: 'all' };

        if (actor.roles.includes(ROLE_PATIENT)) {
            if (!actor.patientId) throw new ForbiddenException('Authenticated patient has no patientId');
            return { mode: 'patients', patientIds: [actor.patientId] };
        }

        if (actor.roles.includes(ROLE_CAREGIVER)) {
            const links = await this.prisma.patientGuardian.findMany({
                where: {
                    guardianUserId: actor.userId,
                    isActive: true,
                    canManageAppointments: true,
                    patient: { deletedAt: null, isActive: true },
                },
                select: { patientId: true },
            });
            return { mode: 'patients', patientIds: links.map((l) => l.patientId) };
        }

        throw new ForbiddenException('Insufficient role permissions');
    }
}

