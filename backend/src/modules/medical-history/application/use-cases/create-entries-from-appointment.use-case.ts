import { Inject, Injectable, Logger } from "@nestjs/common";
import { randomUUID } from "crypto";
import type { MedicalHistoryRepository } from "../ports/medical-history.repository";
import { MedicalHistoryEntry } from "../../domain/entities/medical-history-entry.entity";
import { MedicalHistorySourceEnum } from "../../domain/enums/medical-history-source.enum";
import { MedicalHistoryTypeEnum } from "../../domain/enums/medical-history-type.enum";

export interface AppointmentSnapshot {
    id: string;
    patientId: string;
    startsAt: Date;
    endsAt?: Date;
    diagnosis?: string;
    conclusion?: string;
    followUpNotes?: string;
}

@Injectable()
export class CreateEntriesFromAppointmentUseCase {
    private readonly logger = new Logger(CreateEntriesFromAppointmentUseCase.name);

    constructor(
        @Inject('MedicalHistoryRepository')
        private readonly repository: MedicalHistoryRepository,
    ) {}

    async execute(snapshot: AppointmentSnapshot, recordedByUserId: string): Promise<{ created: number }> {
        const occurredAt = snapshot.endsAt ?? snapshot.startsAt;
        const entries: MedicalHistoryEntry[] = [];

        const pushEntry = (type: MedicalHistoryTypeEnum, title: string, description?: string) => {
            if (!description || !description.trim()) return;
            entries.push(MedicalHistoryEntry.create({
                id: randomUUID(),
                patientId: snapshot.patientId,
                source: MedicalHistorySourceEnum.APPOINTMENT,
                type,
                title,
                description: description.trim(),
                occurredAt,
                appointmentId: snapshot.id,
                createdByUserId: recordedByUserId,
            }));
        };

        pushEntry(MedicalHistoryTypeEnum.DIAGNOSIS, 'Diagnóstico de cita', snapshot.diagnosis);
        pushEntry(MedicalHistoryTypeEnum.CONCLUSION, 'Conclusión de cita', snapshot.conclusion);
        pushEntry(MedicalHistoryTypeEnum.FOLLOW_UP, 'Seguimiento de cita', snapshot.followUpNotes);

        if (entries.length === 0) {
            return { created: 0 };
        }

        try {
            await this.repository.saveEntriesBatch(entries);
            return { created: entries.length };
        } catch (error) {
            this.logger.error(
                `Failed to auto-create medical history entries for appointment ${snapshot.id}: ${(error as Error).message}`,
            );
            return { created: 0 };
        }
    }
}
