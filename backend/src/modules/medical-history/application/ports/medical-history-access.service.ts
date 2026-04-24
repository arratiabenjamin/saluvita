import { ActorContext } from "./actor-context";

export interface MedicalHistoryAccessService {
    ensureCanReadPatientHistory(actor: ActorContext, patientId: string): Promise<void>;
    ensureCanWritePatientHistory(actor: ActorContext, patientId: string): Promise<void>;
}
