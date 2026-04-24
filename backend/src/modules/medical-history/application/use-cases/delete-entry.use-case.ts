import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ActorContext } from "../ports/actor-context";
import type { MedicalHistoryRepository } from "../ports/medical-history.repository";
import type { MedicalHistoryAccessService } from "../ports/medical-history-access.service";
import type { StorageService } from "../../../storage/application/ports/storage.service";
import { MedicalHistoryEntryPatientMismatchError } from "../../domain/errors/medical-history-domain.errors";

@Injectable()
export class DeleteEntryUseCase {
    private readonly logger = new Logger(DeleteEntryUseCase.name);

    constructor(
        @Inject('MedicalHistoryRepository')
        private readonly repository: MedicalHistoryRepository,
        @Inject('MedicalHistoryAccessService')
        private readonly accessService: MedicalHistoryAccessService,
        @Inject('StorageService')
        private readonly storage: StorageService,
    ) {}

    async execute(patientId: string, entryId: string, actor: ActorContext): Promise<{ id: string; deletedObjects: number }> {
        await this.accessService.ensureCanWritePatientHistory(actor, patientId);

        const entry = await this.repository.findEntryById(entryId);
        if (!entry) throw new NotFoundException('Entry not found');
        if (entry.patientId !== patientId) {
            throw new NotFoundException(new MedicalHistoryEntryPatientMismatchError().message);
        }

        const { deletedS3Keys } = await this.repository.deleteEntry(entryId);

        let deletedObjects = 0;
        for (const key of deletedS3Keys) {
            try {
                await this.storage.deleteObject(key);
                deletedObjects += 1;
            } catch (error) {
                this.logger.warn(`Failed to delete S3 object ${key}: ${(error as Error).message}`);
            }
        }

        return { id: entryId, deletedObjects };
    }
}
