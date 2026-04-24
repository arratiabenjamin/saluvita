import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsMimeType, IsPositive, IsString, MaxLength } from "class-validator";

export class RegisterAttachmentDto {
    @ApiProperty({ example: 'medical-history/01b2e879.../entryId.../abc-hemograma.pdf' })
    @IsString()
    @MaxLength(512)
    key!: string;

    @ApiProperty({ example: 'hemograma.pdf' })
    @IsString()
    @MaxLength(255)
    fileName!: string;

    @ApiProperty({ example: 'application/pdf' })
    @IsMimeType()
    mimeType!: string;

    @ApiProperty({ example: 245678 })
    @IsInt()
    @IsPositive()
    sizeBytes!: number;
}
