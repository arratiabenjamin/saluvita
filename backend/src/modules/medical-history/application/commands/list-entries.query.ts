import { MedicalHistorySourceEnum } from "../../domain/enums/medical-history-source.enum";
import { MedicalHistoryTypeEnum } from "../../domain/enums/medical-history-type.enum";

export interface ListEntriesQuery {
    patientId: string;
    source?: MedicalHistorySourceEnum;
    type?: MedicalHistoryTypeEnum;
    from?: Date;
    to?: Date;
    page: number;
    limit: number;
}
