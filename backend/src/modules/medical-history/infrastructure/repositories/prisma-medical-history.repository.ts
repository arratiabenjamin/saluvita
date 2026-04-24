import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../shared/prisma/prisma.service";
import type {
    ListMedicalHistoryFilters,
    ListMedicalHistoryResult,
    MedicalHistoryRepository,
} from "../../application/ports/medical-history.repository";
import { MedicalHistoryEntry } from "../../domain/entities/medical-history-entry.entity";
import { MedicalHistoryAttachment } from "../../domain/entities/medical-history-attachment.entity";
import { MedicalHistoryPrismaMapper } from "../mappers/medical-history-prisma.mapper";

@Injectable()
export class PrismaMedicalHistoryRepository implements MedicalHistoryRepository {
    constructor(private readonly prisma: PrismaService) {}

    async saveEntry(entry: MedicalHistoryEntry): Promise<void> {
        await this.prisma.medicalHistoryEntry.create({
            data: MedicalHistoryPrismaMapper.entryToPersistence(entry),
        });
    }

    async saveEntriesBatch(entries: MedicalHistoryEntry[]): Promise<void> {
        if (entries.length === 0) return;
        await this.prisma.medicalHistoryEntry.createMany({
            data: entries.map((e) => MedicalHistoryPrismaMapper.entryToPersistence(e)),
        });
    }

    async findEntryById(id: string): Promise<MedicalHistoryEntry | null> {
        const raw = await this.prisma.medicalHistoryEntry.findUnique({ where: { id } });
        return raw ? MedicalHistoryPrismaMapper.entryToDomain(raw) : null;
    }

    async updateEntry(entry: MedicalHistoryEntry): Promise<void> {
        await this.prisma.medicalHistoryEntry.update({
            where: { id: entry.id },
            data: {
                type: entry.type as any,
                title: entry.title,
                description: entry.description ?? null,
                occurredAt: entry.occurredAt,
                updatedByUserId: entry.updatedByUserId ?? null,
                updatedAt: entry.updatedAt,
            },
        });
    }

    async deleteEntry(id: string): Promise<{ deletedS3Keys: string[] }> {
        return this.prisma.$transaction(async (tx) => {
            const attachments = await tx.medicalHistoryAttachment.findMany({
                where: { entryId: id },
                select: { s3Key: true },
            });
            await tx.medicalHistoryEntry.delete({ where: { id } });
            return { deletedS3Keys: attachments.map((a) => a.s3Key) };
        });
    }

    async listEntries(filters: ListMedicalHistoryFilters): Promise<ListMedicalHistoryResult> {
        const { patientId, source, type, from, to, page, limit } = filters;
        const skip = (page - 1) * limit;
        const where: any = { patientId };
        if (source) where.source = source;
        if (type) where.type = type;
        if (from || to) {
            where.occurredAt = {};
            if (from) where.occurredAt.gte = from;
            if (to) where.occurredAt.lte = to;
        }

        const [total, rows] = await Promise.all([
            this.prisma.medicalHistoryEntry.count({ where }),
            this.prisma.medicalHistoryEntry.findMany({
                where,
                skip,
                take: limit,
                orderBy: [{ occurredAt: 'desc' }, { createdAt: 'desc' }],
                include: { attachments: true },
            }),
        ]);

        return {
            data: rows.map((row) => ({
                entry: MedicalHistoryPrismaMapper.entryToDomain(row),
                attachments: row.attachments.map(MedicalHistoryPrismaMapper.attachmentToDomain),
            })),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async saveAttachment(attachment: MedicalHistoryAttachment): Promise<void> {
        await this.prisma.medicalHistoryAttachment.create({
            data: MedicalHistoryPrismaMapper.attachmentToPersistence(attachment),
        });
    }

    async findAttachmentById(id: string): Promise<MedicalHistoryAttachment | null> {
        const raw = await this.prisma.medicalHistoryAttachment.findUnique({ where: { id } });
        return raw ? MedicalHistoryPrismaMapper.attachmentToDomain(raw) : null;
    }

    async listAttachmentsByEntry(entryId: string): Promise<MedicalHistoryAttachment[]> {
        const rows = await this.prisma.medicalHistoryAttachment.findMany({
            where: { entryId },
            orderBy: { createdAt: 'desc' },
        });
        return rows.map(MedicalHistoryPrismaMapper.attachmentToDomain);
    }

    async deleteAttachment(id: string): Promise<void> {
        await this.prisma.medicalHistoryAttachment.delete({ where: { id } });
    }
}
