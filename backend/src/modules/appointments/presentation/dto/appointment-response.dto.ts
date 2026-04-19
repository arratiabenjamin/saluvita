import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AppointmentStatusEnum } from "../../domain/enums/appointment-status.enum";

export class AppointmentResponseDto {
    @ApiProperty({ example: '8f32d2d2-7e9b-4f3b-b31a-8c9e2bb2fd5a' })
    id!: string;

    @ApiProperty({ example: '01b2e879-9938-4a29-b01b-aab96eb2ede6' })
    patientId!: string;

    @ApiProperty({ example: '36bb7863-545a-4024-abdb-b9bb812932db' })
    recordedByUserId!: string;

    @ApiProperty({ example: '2026-05-20T14:30:00.000Z' })
    startsAt!: string;

    @ApiPropertyOptional({ example: '2026-05-20T15:00:00.000Z' })
    endsAt?: string;

    @ApiProperty({ enum: AppointmentStatusEnum, example: AppointmentStatusEnum.PLANNED })
    status!: AppointmentStatusEnum;

    @ApiPropertyOptional({ example: 'Control general' })
    reason?: string;

    @ApiPropertyOptional({ example: 'Clínica Santa María' })
    facilityName?: string;

    @ApiPropertyOptional({ example: 'Av. Santa María 0500, Santiago' })
    facilityAddress?: string;

    @ApiPropertyOptional({ example: 'Dra. Paula Rojas' })
    doctorName?: string;

    @ApiPropertyOptional({ example: 'Medicina General' })
    specialty?: string;

    @ApiPropertyOptional({ example: true })
    wasAttended?: boolean;

    @ApiPropertyOptional({ example: 'Migraña' })
    diagnosis?: string;

    @ApiPropertyOptional({ example: 'Tratamiento farmacológico por 7 días' })
    conclusion?: string;

    @ApiPropertyOptional({ example: 'Control en 2 semanas' })
    followUpNotes?: string;

    @ApiPropertyOptional({ example: 'No pude asistir por urgencia familiar' })
    cancelledReason?: string;

    @ApiProperty({ example: '2026-04-15T19:00:00.000Z' })
    createdAt!: string;

    @ApiProperty({ example: '2026-04-15T19:10:00.000Z' })
    updatedAt!: string;
}

