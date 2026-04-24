import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { ActorContext } from "../ports/actor-context";
import type { MedicalHistoryRepository } from "../ports/medical-history.repository";
import type { MedicalHistoryAccessService } from "../ports/medical-history-access.service";
import type { StorageService } from "../../../storage/application/ports/storage.service";
import { MedicalHistoryAttachment } from "../../domain/entities/medical-history-attachment.entity";
import { MedicalHistoryEntryPatientMismatchError } from "../../domain/errors/medical-history-domain.errors";

@Injectable()
export class RegisterAttachmentUseCase {
    constructor(
        @Inject('MedicalHistoryRepository')
        private readonly repository: MedicalHistoryRepository,
        @Inject('MedicalHistoryAccessService')
        private readonly accessService: MedicalHistoryAccessService,
        @Inject('StorageService')
        private readonly storage: StorageService,
    ) {}

    async execute(
        patientId: string,
        entryId: string,
        params: {
            key: string;
            fileName: string;
            mimeType: string;
            sizeBytes: number;
        },
        actor: ActorContext,
    ): Promise<{ id: string }> {
        await this.accessService.ensureCanWritePatientHistory(actor, patientId);

        const entry = await this.repository.findEntryById(entryId);
        if (!entry) throw new NotFoundException('Entry not found');
        if (entry.patientId !== patientId) {
            throw new NotFoundException(new MedicalHistoryEntryPatientMismatchError().message);
        }

        const attachment = MedicalHistoryAttachment.create({
            id: randomUUID(),
            entryId,
            fileName: params.fileName,
            fileMimeType: params.mimeType,
            fileSizeBytes: params.sizeBytes,
            s3Bucket: this.storage.getBucket(),
            s3Key: params.key,
            uploadedByUserId: actor.userId,
        });

        await this.repository.saveAttachment(attachment);
        return { id: attachment.id };
    }
}
