import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { RequestAttachmentUploadUseCase } from "../../application/use-cases/request-attachment-upload.use-case";
import { RequestAttachmentUploadDto } from "../dto/request-attachment-upload.dto";
import { CurrentUser } from "../../../../shared/auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../../../shared/auth/interfaces/authenticated-user.interface";
import { JwtAuthGuard } from "../../../../shared/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../../shared/auth/guards/roles.guard";
import { Roles } from "../../../../shared/auth/decorators/roles.decorator";
import { ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT } from "../../../../shared/auth/roles.constants";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE_ADMIN, ROLE_CAREGIVER, ROLE_PATIENT)
@ApiTags('Medical History - Attachments')
@ApiBearerAuth('access-token')
@Controller('/v1/patients/:patientId/medical-history/:entryId/attachments')
export class RequestAttachmentUploadController {
    constructor(private readonly useCase: RequestAttachmentUploadUseCase) {}

    @ApiOperation({ summary: 'Solicitar URL firmada para subir adjunto a S3' })
    @ApiParam({ name: 'patientId' })
    @ApiParam({ name: 'entryId' })
    @ApiBody({ type: RequestAttachmentUploadDto })
    @ApiOkResponse({ description: 'URL firmada generada' })
    @Post('presign')
    async handle(
        @Param('patientId') patientId: string,
        @Param('entryId') entryId: string,
        @Body() dto: RequestAttachmentUploadDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.useCase.execute(patientId, entryId, {
            fileName: dto.fileName,
            mimeType: dto.mimeType,
            sizeBytes: dto.sizeBytes,
        }, user);
    }
}
