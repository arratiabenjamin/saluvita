import { MedicalHistoryTypeEnum } from "../../domain/enums/medical-history-type.enum";

export interface UpdateEntryCommand {
    patientId: string;
    entryId: string;
    type?: MedicalHistoryTypeEnum;
    title?: string;
    description?: string;
    occurredAt?: Date;
}
