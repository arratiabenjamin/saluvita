import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ActorContext } from "../ports/actor-context";
import type { MedicalHistoryRepository } from "../ports/medical-history.repository";
import type { MedicalHistoryAccessService } from "../ports/medical-history-access.service";
import type { StorageService } from "../../../storage/application/ports/storage.service";
import { MedicalHistoryEntryPatientMismatchError } from "../../domain/errors/medical-history-domain.errors";

@Injectable()
export class DeleteAttachmentUseCase {
    private readonly logger = new Logger(DeleteAttachmentUseCase.name);

    constructor(
        @Inject('MedicalHistoryRepository')
        private readonly repository: MedicalHistoryRepository,
        @Inject('MedicalHistoryAccessService')
        private readonly accessService: MedicalHistoryAccessService,
        @Inject('StorageService')
        private readonly storage: StorageService,
    ) {}

    async execute(patientId: string, entryId: string, attachmentId: string, actor: ActorContext): Promise<{ id: string }> {
        await this.accessService.ensureCanWritePatientHistory(actor, patientId);

        const entry = await this.repository.findEntryById(entryId);
        if (!entry) throw new NotFoundException('Entry not found');
        if (entry.patientId !== patientId) {
            throw new NotFoundException(new MedicalHistoryEntryPatientMismatchError().message);
        }

        const attachment = await this.repository.findAttachmentById(attachmentId);
        if (!attachment || attachment.entryId !== entryId) {
            throw new NotFoundException('Attachment not found');
        }

        await this.repository.deleteAttachment(attachmentId);
        try {
            await this.storage.deleteObject(attachment.s3Key);
        } catch (error) {
            this.logger.warn(`Failed to delete S3 object ${attachment.s3Key}: ${(error as Error).message}`);
        }

        return { id: attachmentId };
    }
}
