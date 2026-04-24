import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { RegisterAttachmentUseCase } from "../../application/use-cases/register-attachment.use-case";
import { RegisterAttachmentDto } from "../dto/register-attachment.dto";
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
export class RegisterAttachmentController {
    constructor(private readonly useCase: RegisterAttachmentUseCase) {}

    @ApiOperation({ summary: 'Registrar metadata del adjunto tras upload a S3' })
    @ApiParam({ name: 'patientId' })
    @ApiParam({ name: 'entryId' })
    @ApiBody({ type: RegisterAttachmentDto })
    @ApiCreatedResponse({ description: 'Adjunto registrado' })
    @Post()
    async handle(
        @Param('patientId') patientId: string,
        @Param('entryId') entryId: string,
        @Body() dto: RegisterAttachmentDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        const result = await this.useCase.execute(patientId, entryId, {
            key: dto.key,
            fileName: dto.fileName,
            mimeType: dto.mimeType,
            sizeBytes: dto.sizeBytes,
        }, user);
        return { data: result };
    }
}
