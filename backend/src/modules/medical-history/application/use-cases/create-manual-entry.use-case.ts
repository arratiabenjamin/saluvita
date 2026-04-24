import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { CreateManualEntryCommand } from "../commands/create-manual-entry.command";
import { ActorContext } from "../ports/actor-context";
import type { MedicalHistoryRepository } from "../ports/medical-history.repository";
import type { MedicalHistoryAccessService } from "../ports/medical-history-access.service";
import { MedicalHistoryEntry } from "../../domain/entities/medical-history-entry.entity";
import { MedicalHistorySourceEnum } from "../../domain/enums/medical-history-source.enum";

@Injectable()
export class CreateManualEntryUseCase {
    constructor(
        @Inject('MedicalHistoryRepository')
        private readonly repository: MedicalHistoryRepository,
        @Inject('MedicalHistoryAccessService')
        private readonly accessService: MedicalHistoryAccessService,
    ) {}

    async execute(command: CreateManualEntryCommand, actor: ActorContext): Promise<{ id: string }> {
        await this.accessService.ensureCanWritePatientHistory(actor, command.patientId);

        const entry = MedicalHistoryEntry.create({
            id: randomUUID(),
            patientId: command.patientId,
            source: MedicalHistorySourceEnum.MANUAL,
            type: command.type,
            title: command.title.trim(),
            description: command.description?.trim() || undefined,
            occurredAt: command.occurredAt,
            createdByUserId: actor.userId,
        });

        await this.repository.saveEntry(entry);
        return { id: entry.id };
    }
}
