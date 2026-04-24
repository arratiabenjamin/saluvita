import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";

export class UpdateGuardianPermissionsDto {
    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    canEditProfile?: boolean;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    canManageAppointments?: boolean;
}
