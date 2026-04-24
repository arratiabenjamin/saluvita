import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { MedicalHistorySourceEnum } from "../../domain/enums/medical-history-source.enum";
import { MedicalHistoryTypeEnum } from "../../domain/enums/medical-history-type.enum";

export class MedicalHistoryAttachmentSummaryDto {
    @ApiProperty()
    id!: string;

    @ApiProperty({ example: 'hemograma.pdf' })
    fileName!: string;

    @ApiProperty({ example: 'application/pdf' })
    fileMimeType!: string;

    @ApiProperty({ example: 245678 })
    fileSizeBytes!: number;

    @ApiProperty()
    uploadedByUserId!: string;

    @ApiProperty({ example: '2026-04-24T14:00:00.000Z' })
    createdAt!: string;
}

export class MedicalHistoryEntryResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    patientId!: string;

    @ApiProperty({ enum: MedicalHistorySourceEnum })
    source!: MedicalHistorySourceEnum;

    @ApiProperty({ enum: MedicalHistoryTypeEnum })
    type!: MedicalHistoryTypeEnum;

    @ApiProperty({ example: 'Diagnóstico de cita' })
    title!: string;

    @ApiPropertyOptional({ example: 'Migraña con aura' })
    description?: string | null;

    @ApiProperty({ example: '2026-04-20T10:00:00.000Z' })
    occurredAt!: string;

    @ApiPropertyOptional()
    appointmentId?: string | null;

    @ApiProperty()
    createdByUserId!: string;

    @ApiPropertyOptional()
    updatedByUserId?: string | null;

    @ApiProperty({ example: '2026-04-24T14:00:00.000Z' })
    createdAt!: string;

    @ApiProperty({ example: '2026-04-24T14:00:00.000Z' })
    updatedAt!: string;

    @ApiProperty({ type: [MedicalHistoryAttachmentSummaryDto] })
    attachments!: MedicalHistoryAttachmentSummaryDto[];
}
