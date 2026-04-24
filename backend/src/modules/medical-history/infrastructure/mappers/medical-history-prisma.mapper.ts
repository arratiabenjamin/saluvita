import type {
    MedicalHistoryEntry as PrismaMedicalHistoryEntry,
    MedicalHistoryAttachment as PrismaMedicalHistoryAttachment,
} from "@prisma/client";
import { MedicalHistoryEntry } from "../../domain/entities/medical-history-entry.entity";
import { MedicalHistoryAttachment } from "../../domain/entities/medical-history-attachment.entity";
import { MedicalHistorySourceEnum } from "../../domain/enums/medical-history-source.enum";
import { MedicalHistoryTypeEnum } from "../../domain/enums/medical-history-type.enum";

export class MedicalHistoryPrismaMapper {
    static entryToDomain(raw: PrismaMedicalHistoryEntry): MedicalHistoryEntry {
        return MedicalHistoryEntry.rehydrate({
            id: raw.id,
            patientId: raw.patientId,
            source: raw.source as unknown as MedicalHistorySourceEnum,
            type: raw.type as unknown as MedicalHistoryTypeEnum,
            title: raw.title,
            description: raw.description ?? undefined,
            occurredAt: raw.occurredAt,
            appointmentId: raw.appointmentId ?? undefined,
            createdByUserId: raw.createdByUserId,
            updatedByUserId: raw.updatedByUserId ?? undefined,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }

    static entryToPersistence(entry: MedicalHistoryEntry) {
        return {
            id: entry.id,
            patientId: entry.patientId,
            source: entry.source as any,
            type: entry.type as any,
            title: entry.title,
            description: entry.description ?? null,
            occurredAt: entry.occurredAt,
            appointmentId: entry.appointmentId ?? null,
            createdByUserId: entry.createdByUserId,
            updatedByUserId: entry.updatedByUserId ?? null,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt,
        };
    }

    static attachmentToDomain(raw: PrismaMedicalHistoryAttachment): MedicalHistoryAttachment {
        return MedicalHistoryAttachment.rehydrate({
            id: raw.id,
            entryId: raw.entryId,
            fileName: raw.fileName,
            fileMimeType: raw.fileMimeType,
            fileSizeBytes: raw.fileSizeBytes,
            s3Bucket: raw.s3Bucket,
            s3Key: raw.s3Key,
            uploadedByUserId: raw.uploadedByUserId,
            createdAt: raw.createdAt,
        });
    }

    static attachmentToPersistence(attachment: MedicalHistoryAttachment) {
        return {
            id: attachment.id,
            entryId: attachment.entryId,
            fileName: attachment.fileName,
            fileMimeType: attachment.fileMimeType,
            fileSizeBytes: attachment.fileSizeBytes,
            s3Bucket: attachment.s3Bucket,
            s3Key: attachment.s3Key,
            uploadedByUserId: attachment.uploadedByUserId,
            createdAt: attachment.createdAt,
        };
    }
}
