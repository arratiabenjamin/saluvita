import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsMimeType, IsPositive, IsString, MaxLength } from "class-validator";

export class RequestAttachmentUploadDto {
    @ApiProperty({ example: 'hemograma.pdf' })
    @IsString()
    @MaxLength(255)
    fileName!: string;

    @ApiProperty({ example: 'application/pdf' })
    @IsMimeType()
    mimeType!: string;

    @ApiProperty({ example: 245678, description: 'Tamaño en bytes del archivo a subir' })
    @IsInt()
    @IsPositive()
    sizeBytes!: number;
}
