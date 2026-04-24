import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "crypto";
import { ActorContext } from "../ports/actor-context";
import type { MedicalHistoryRepository } from "../ports/medical-history.repository";
import type { MedicalHistoryAccessService } from "../ports/medical-history-access.service";
import type { StorageService } from "../../../storage/application/ports/storage.service";
import { MedicalHistoryEntryPatientMismatchError } from "../../domain/errors/medical-history-domain.errors";

const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
];

@Injectable()
export class RequestAttachmentUploadUseCase {
    constructor(
        @Inject('MedicalHistoryRepository')
        private readonly repository: MedicalHistoryRepository,
        @Inject('MedicalHistoryAccessService')
        private readonly accessService: MedicalHistoryAccessService,
        @Inject('StorageService')
        private readonly storage: StorageService,
        private readonly configService: ConfigService,
    ) {}

    async execute(
        patientId: string,
        entryId: string,
        params: { fileName: string; mimeType: string; sizeBytes: number },
        actor: ActorContext,
    ) {
        await this.accessService.ensureCanWritePatientHistory(actor, patientId);

        const entry = await this.repository.findEntryById(entryId);
        if (!entry) throw new NotFoundException('Entry not found');
        if (entry.patientId !== patientId) {
            throw new NotFoundException(new MedicalHistoryEntryPatientMismatchError().message);
        }

        if (!ALLOWED_MIME_TYPES.includes(params.mimeType)) {
            throw new BadRequestException(
                `MIME type '${params.mimeType}' is not allowed. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
            );
        }

        const maxSize = Number(this.configService.get<string>('AWS_S3_MAX_FILE_SIZE_BYTES') ?? 10485760);
        if (params.sizeBytes <= 0 || params.sizeBytes > maxSize) {
            throw new BadRequestException(`File size must be between 1 byte and ${maxSize} bytes.`);
        }

        const safeName = params.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const key = this.storage.buildObjectKey([
            'medical-history',
            patientId,
            entryId,
            `${randomUUID()}-${safeName}`,
        ]);

        const upload = await this.storage.generateUploadUrl({
            key,
            mimeType: params.mimeType,
            maxSizeBytes: params.sizeBytes,
        });

        return {
            data: {
                uploadUrl: upload.url,
                method: upload.method,
                headers: upload.headers,
                bucket: upload.bucket,
                key: upload.key,
                expiresAt: upload.expiresAt.toISOString(),
            },
        };
    }
}
