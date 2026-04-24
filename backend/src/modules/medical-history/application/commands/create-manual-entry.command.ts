import { MedicalHistoryTypeEnum } from "../../domain/enums/medical-history-type.enum";

export interface CreateManualEntryCommand {
    patientId: string;
    type: MedicalHistoryTypeEnum;
    title: string;
    description?: string;
    occurredAt: Date;
}
