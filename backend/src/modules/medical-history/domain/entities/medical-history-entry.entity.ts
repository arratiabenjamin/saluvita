import { MedicalHistorySourceEnum } from "../enums/medical-history-source.enum";
import { MedicalHistoryTypeEnum } from "../enums/medical-history-type.enum";

export type MedicalHistoryEntryProps = {
    id: string;
    patientId: string;
    source: MedicalHistorySourceEnum;
    type: MedicalHistoryTypeEnum;
    title: string;
    description?: string;
    occurredAt: Date;
    appointmentId?: string;
    createdByUserId: string;
    updatedByUserId?: string;
    createdAt: Date;
    updatedAt: Date;
};

export type UpdateMedicalHistoryEntryInput = {
    type?: MedicalHistoryTypeEnum;
    title?: string;
    description?: string;
    occurredAt?: Date;
};

export class MedicalHistoryEntry {
    private constructor(private props: MedicalHistoryEntryProps) {}

    static create(props: Omit<MedicalHistoryEntryProps, 'createdAt' | 'updatedAt'>): MedicalHistoryEntry {
        const now = new Date();
        return new MedicalHistoryEntry({ ...props, createdAt: now, updatedAt: now });
    }

    static rehydrate(props: MedicalHistoryEntryProps): MedicalHistoryEntry {
        return new MedicalHistoryEntry(props);
    }

    get id() { return this.props.id; }
    get patientId() { return this.props.patientId; }
    get source() { return this.props.source; }
    get type() { return this.props.type; }
    get title() { return this.props.title; }
    get description() { return this.props.description; }
    get occurredAt() { return this.props.occurredAt; }
    get appointmentId() { return this.props.appointmentId; }
    get createdByUserId() { return this.props.createdByUserId; }
    get updatedByUserId() { return this.props.updatedByUserId; }
    get createdAt() { return this.props.createdAt; }
    get updatedAt() { return this.props.updatedAt; }

    update(input: UpdateMedicalHistoryEntryInput, updatedByUserId: string) {
        if (input.type !== undefined) this.props.type = input.type;
        if (input.title !== undefined) {
            const trimmed = input.title.trim();
            if (trimmed.length > 0) this.props.title = trimmed;
        }
        if (input.description !== undefined) {
            const trimmed = input.description.trim();
            this.props.description = trimmed.length ? trimmed : undefined;
        }
        if (input.occurredAt !== undefined) this.props.occurredAt = input.occurredAt;
        this.props.updatedByUserId = updatedByUserId;
        this.props.updatedAt = new Date();
    }
}
