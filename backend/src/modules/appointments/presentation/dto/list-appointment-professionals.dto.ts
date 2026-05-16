import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";

export class ListAppointmentProfessionalsQueryDto {
    @ApiPropertyOptional({ example: '01b2e879-9938-4a29-b01b-aab96eb2ede6' })
    @IsOptional()
    @IsUUID()
    patientId?: string;
}

export class AppointmentProfessionalResponseDto {
    @ApiProperty({ example: 'Dra. Paula Rojas|Medicina General' })
    id!: string;

    @ApiProperty({ example: 'Dra. Paula Rojas' })
    doctorName!: string;

    @ApiPropertyOptional({ example: 'Medicina General' })
    specialty?: string | null;

    @ApiPropertyOptional({ example: 'Clínica Santa María' })
    facilityName?: string | null;

    @ApiPropertyOptional({ example: 'Av. Santa María 0500, Santiago' })
    facilityAddress?: string | null;

    @ApiProperty({ example: 3 })
    totalAppointments!: number;

    @ApiPropertyOptional({ example: '2026-05-12T10:30:00.000Z' })
    lastAppointmentAt?: string | null;

    @ApiPropertyOptional({ example: '2026-04-28T10:30:00.000Z' })
    lastCompletedAt?: string | null;

    @ApiPropertyOptional({ example: '2026-06-02T10:30:00.000Z' })
    nextAppointmentAt?: string | null;
}
