import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class CancelAppointmentDto {
    @ApiProperty({ example: 'No pude asistir por urgencia familiar' })
    @IsString()
    @MinLength(3)
    cancelledReason!: string;
}

