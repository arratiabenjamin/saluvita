import { MedicalHistoryEntry } from "../../domain/entities/medical-history-entry.entity";
import { MedicalHistoryAttachment } from "../../domain/entities/medical-history-attachment.entity";
import { MedicalHistorySourceEnum } from "../../domain/enums/medical-history-source.enum";
import { MedicalHistoryTypeEnum } from "../../domain/enums/medical-history-type.enum";

export interface ListMedicalHistoryFilters {
    patientId: string;
    source?: MedicalHistorySourceEnum;
    type?: MedicalHistoryTypeEnum;
    from?: Date;
    to?: Date;
    page: number;
    limit: number;
}

export interface ListMedicalHistoryResult {
    data: Array<{
        entry: MedicalHistoryEntry;
        attachments: MedicalHistoryAttachment[];
    }>;
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface MedicalHistoryRepository {
    saveEntry(entry: MedicalHistoryEntry): Promise<void>;
    saveEntriesBatch(entries: MedicalHistoryEntry[]): Promise<void>;
    findEntryById(id: string): Promise<MedicalHistoryEntry | null>;
    updateEntry(entry: MedicalHistoryEntry): Promise<void>;
    deleteEntry(id: string): Promise<{ deletedS3Keys: string[] }>;
    listEntries(filters: ListMedicalHistoryFilters): Promise<ListMedicalHistoryResult>;

    saveAttachment(attachment: MedicalHistoryAttachment): Promise<void>;
    findAttachmentById(id: string): Promise<MedicalHistoryAttachment | null>;
    listAttachmentsByEntry(entryId: string): Promise<MedicalHistoryAttachment[]>;
    deleteAttachment(id: string): Promise<void>;
}
