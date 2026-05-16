import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../shared/prisma/prisma.service";
import type {
    AppointmentListScope,
    AppointmentProfessionalSummary,
    AppointmentQueryService,
} from "../../application/ports/appointment-query.service";
import { ListAppointmentsQuery } from "../../application/queries/list-appointments.query";
import { ListAppointmentProfessionalsQuery } from "../../application/queries/list-appointment-professionals.query";

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

    async listProfessionals(
        query: ListAppointmentProfessionalsQuery,
        scope: AppointmentListScope,
    ): Promise<AppointmentProfessionalSummary[]> {
        const where: any = {
            doctorName: { not: null },
        };

        if (scope.mode === 'patients') {
            if (!scope.patientIds.length) return [];
            where.patientId = { in: scope.patientIds };
        }

        if (query.patientId) {
            where.patientId = scope.mode === 'all'
                ? query.patientId
                : { in: scope.patientIds.filter((id) => id === query.patientId) };
        }

        const items = await this.prisma.appointment.findMany({
            where,
            orderBy: [{ startsAt: 'desc' }],
            select: {
                doctorName: true,
                specialty: true,
                facilityName: true,
                facilityAddress: true,
                startsAt: true,
                status: true,
            },
        });

        const now = new Date();
        const grouped = new Map<string, AppointmentProfessionalSummary>();

        for (const item of items) {
            if (!item.doctorName) continue;

            const key = `${item.doctorName}|${item.specialty ?? ''}`;
            const existing = grouped.get(key);

            if (!existing) {
                grouped.set(key, {
                    id: key,
                    doctorName: item.doctorName,
                    specialty: item.specialty,
                    facilityName: item.facilityName,
                    facilityAddress: item.facilityAddress,
                    totalAppointments: 1,
                    lastAppointmentAt: item.startsAt,
                    lastCompletedAt: item.status === 'COMPLETED' ? item.startsAt : null,
                    nextAppointmentAt:
                        item.status === 'PLANNED' && item.startsAt >= now ? item.startsAt : null,
                });
                continue;
            }

            existing.totalAppointments += 1;

            if (!existing.facilityName && item.facilityName) {
                existing.facilityName = item.facilityName;
                existing.facilityAddress = item.facilityAddress;
            }

            if (!existing.lastAppointmentAt || item.startsAt > existing.lastAppointmentAt) {
                existing.lastAppointmentAt = item.startsAt;
            }

            if (item.status === 'COMPLETED') {
                if (!existing.lastCompletedAt || item.startsAt > existing.lastCompletedAt) {
                    existing.lastCompletedAt = item.startsAt;
                }
            }

            if (item.status === 'PLANNED' && item.startsAt >= now) {
                if (!existing.nextAppointmentAt || item.startsAt < existing.nextAppointmentAt) {
                    existing.nextAppointmentAt = item.startsAt;
                }
            }
        }

        return Array.from(grouped.values()).sort((a, b) => {
            const ta = a.lastAppointmentAt?.getTime() ?? 0;
            const tb = b.lastAppointmentAt?.getTime() ?? 0;
            return tb - ta;
        });
    }
}
