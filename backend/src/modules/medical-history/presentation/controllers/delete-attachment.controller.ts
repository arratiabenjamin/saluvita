import { Controller, Delete, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { DeleteAttachmentUseCase } from "../../application/use-cases/delete-attachment.use-case";
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
export class DeleteAttachmentController {
    constructor(private readonly useCase: DeleteAttachmentUseCase) {}

    @ApiOperation({ summary: 'Eliminar adjunto (borra en S3 y DB)' })
    @ApiParam({ name: 'patientId' })
    @ApiParam({ name: 'entryId' })
    @ApiParam({ name: 'attachmentId' })
    @ApiOkResponse({ description: 'Adjunto eliminado' })
    @Delete(':attachmentId')
    async handle(
        @Param('patientId') patientId: string,
        @Param('entryId') entryId: string,
        @Param('attachmentId') attachmentId: string,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        const result = await this.useCase.execute(patientId, entryId, attachmentId, user);
        return { data: result };
    }
}
