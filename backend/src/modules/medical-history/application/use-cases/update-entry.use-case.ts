import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UpdateEntryCommand } from "../commands/update-entry.command";
import { ActorContext } from "../ports/actor-context";
import type { MedicalHistoryRepository } from "../ports/medical-history.repository";
import type { MedicalHistoryAccessService } from "../ports/medical-history-access.service";
import { MedicalHistoryEntryPatientMismatchError } from "../../domain/errors/medical-history-domain.errors";

@Injectable()
export class UpdateEntryUseCase {
    constructor(
        @Inject('MedicalHistoryRepository')
        private readonly repository: MedicalHistoryRepository,
        @Inject('MedicalHistoryAccessService')
        private readonly accessService: MedicalHistoryAccessService,
    ) {}

    async execute(command: UpdateEntryCommand, actor: ActorContext): Promise<{ id: string }> {
        await this.accessService.ensureCanWritePatientHistory(actor, command.patientId);

        const entry = await this.repository.findEntryById(command.entryId);
        if (!entry) throw new NotFoundException('Entry not found');
        if (entry.patientId !== command.patientId) {
            throw new NotFoundException(new MedicalHistoryEntryPatientMismatchError().message);
        }

        entry.update({
            type: command.type,
            title: command.title,
            description: command.description,
            occurredAt: command.occurredAt,
        }, actor.userId);

        await this.repository.updateEntry(entry);
        return { id: entry.id };
    }
}
