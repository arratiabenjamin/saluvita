import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class ListPatientsQueryDto {
    @ApiPropertyOptional({ example: 1, default: 1 })
    @IsOptional() @Type(() => Number) @IsInt() @Min(1) page : number = 1;
    @ApiPropertyOptional({ example: 20, default: 20, minimum: 1, maximum: 100 })
    @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit : number = 20;
    @ApiPropertyOptional({ example: 'Maria' })
    @IsOptional() @IsString() search?: string;
}
