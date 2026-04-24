import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ActorContext } from "../ports/actor-context";
import type { MedicalHistoryRepository } from "../ports/medical-history.repository";
import type { MedicalHistoryAccessService } from "../ports/medical-history-access.service";
import type { StorageService } from "../../../storage/application/ports/storage.service";
import { MedicalHistoryEntryPatientMismatchError } from "../../domain/errors/medical-history-domain.errors";

@Injectable()
export class GetAttachmentDownloadUrlUseCase {
    constructor(
        @Inject('MedicalHistoryRepository')
        private readonly repository: MedicalHistoryRepository,
        @Inject('MedicalHistoryAccessService')
        private readonly accessService: MedicalHistoryAccessService,
        @Inject('StorageService')
        private readonly storage: StorageService,
    ) {}

    async execute(patientId: string, entryId: string, attachmentId: string, actor: ActorContext) {
        await this.accessService.ensureCanReadPatientHistory(actor, patientId);

        const entry = await this.repository.findEntryById(entryId);
        if (!entry) throw new NotFoundException('Entry not found');
        if (entry.patientId !== patientId) {
            throw new NotFoundException(new MedicalHistoryEntryPatientMismatchError().message);
        }

        const attachment = await this.repository.findAttachmentById(attachmentId);
        if (!attachment || attachment.entryId !== entryId) {
            throw new NotFoundException('Attachment not found');
        }

        const { url, expiresAt } = await this.storage.generateDownloadUrl(attachment.s3Key);

        return {
            data: {
                url,
                expiresAt: expiresAt.toISOString(),
                fileName: attachment.fileName,
                fileMimeType: attachment.fileMimeType,
                fileSizeBytes: attachment.fileSizeBytes,
            },
        };
    }
}
