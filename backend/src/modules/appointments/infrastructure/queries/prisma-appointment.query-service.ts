import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../shared/prisma/prisma.service";
import type { AppointmentListScope, AppointmentQueryService } from "../../application/ports/appointment-query.service";
import { ListAppointmentsQuery } from "../../application/queries/list-appointments.query";

@Injectable()
export class PrismaAppointmentQueryService implements AppointmentQueryService {
    constructor(private readonly prisma: PrismaService) {}

    async listPaginated(query: ListAppointmentsQuery, scope: AppointmentListScope) {
        const { page, limit, patientId, status, from, to, search } = query;
        const skip = (page - 1) * limit;

        const where: any = {};

        // Scope de seguridad: si no es admin, se limita a patientIds explícitos.
        if (scope.mode === 'patients') {
            if (!scope.patientIds.length) {
                return {
                    data: [],
                    meta: { total: 0, page, limit, totalPages: 0 },
                };
            }
            where.patientId = { in: scope.patientIds };
        }

        if (patientId) {
            where.patientId = scope.mode === 'all'
                ? patientId
                : { in: scope.patientIds.filter((id) => id === patientId) };
        }

        if (status) where.status = status;

        if (from || to) {
            where.startsAt = {};
            if (from) where.startsAt.gte = from;
            if (to) where.startsAt.lte = to;
        }

        if (search) {
            where.OR = [
                { reason: { contains: search, mode: 'insensitive' } },
                { facilityName: { contains: search, mode: 'insensitive' } },
                { doctorName: { contains: search, mode: 'insensitive' } },
                { specialty: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [total, items] = await Promise.all([
            this.prisma.appointment.count({ where }),
            this.prisma.appointment.findMany({
                where,
                skip,
                take: limit,
                orderBy: [{ startsAt: 'desc' }, { createdAt: 'desc' }],
                select: {
                    id: true,
                    patientId: true,
                    startsAt: true,
                    endsAt: true,
                    status: true,
                    reason: true,
                    facilityName: true,
                    facilityAddress: true,
                    doctorName: true,
                    specialty: true,
                    wasAttended: true,
                    diagnosis: true,
                    conclusion: true,
                    followUpNotes: true,
                    cancelledReason: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
        ]);

        return {
            data: items,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}

