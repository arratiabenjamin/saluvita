import { Inject, Injectable } from "@nestjs/common";
import { ListEntriesQuery } from "../commands/list-entries.query";
import { ActorContext } from "../ports/actor-context";
import type { MedicalHistoryRepository } from "../ports/medical-history.repository";
import type { MedicalHistoryAccessService } from "../ports/medical-history-access.service";

@Injectable()
export class ListEntriesUseCase {
    constructor(
        @Inject('MedicalHistoryRepository')
        private readonly repository: MedicalHistoryRepository,
        @Inject('MedicalHistoryAccessService')
        private readonly accessService: MedicalHistoryAccessService,
    ) {}

    async execute(query: ListEntriesQuery, actor: ActorContext) {
        await this.accessService.ensureCanReadPatientHistory(actor, query.patientId);

        const result = await this.repository.listEntries({
            patientId: query.patientId,
            source: query.source,
            type: query.type,
            from: query.from,
            to: query.to,
            page: query.page,
            limit: query.limit,
        });

        return {
            data: result.data.map(({ entry, attachments }) => ({
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
            })),
            meta: result.meta,
        };
    }
}
