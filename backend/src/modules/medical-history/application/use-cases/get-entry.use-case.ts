import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ActorContext } from "../ports/actor-context";
import type { MedicalHistoryRepository } from "../ports/medical-history.repository";
import type { MedicalHistoryAccessService } from "../ports/medical-history-access.service";
import { MedicalHistoryEntryPatientMismatchError } from "../../domain/errors/medical-history-domain.errors";

@Injectable()
export class GetEntryUseCase {
    constructor(
        @Inject('MedicalHistoryRepository')
        private readonly repository: MedicalHistoryRepository,
        @Inject('MedicalHistoryAccessService')
        private readonly accessService: MedicalHistoryAccessService,
    ) {}

    async execute(patientId: string, entryId: string, actor: ActorContext) {
        await this.accessService.ensureCanReadPatientHistory(actor, patientId);

        const entry = await this.repository.findEntryById(entryId);
        if (!entry) throw new NotFoundException('Entry not found');
        if (entry.patientId !== patientId) {
            throw new NotFoundException(new MedicalHistoryEntryPatientMismatchError().message);
        }

        const attachments = await this.repository.listAttachmentsByEntry(entryId);

        return {
            data: {
                id: entry.id,
                patientId: entry.patientId,
                source: entry.source,
                type: entry.type,
                title: entry.title,
                description: entry.description ?? null,
                occurredAt: entry.occurredAt.toISOString(),
                appointmentId: entry.appointmentId ?? null,
                createdByUserId: entry.createdByUserId,
                updatedByUserId: entry.updatedByUserId ?? null,
                createdAt: entry.createdAt.toISOString(),
                updatedAt: entry.updatedAt.toISOString(),
                attachments: attachments.map((a) => ({
                    id: a.id,
                    fileName: a.fileName,
                    fileMimeType: a.fileMimeType,
                    fileSizeBytes: a.fileSizeBytes,
                    uploadedByUserId: a.uploadedByUserId,
                    createdAt: a.createdAt.toISOString(),
                })),
            },
        };
    }
}
