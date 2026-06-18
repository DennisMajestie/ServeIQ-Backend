
import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTableDto {
  @ApiProperty({ example: 'T1' })
  @IsString()
  @IsNotEmpty()
  table_number: string;

  @ApiProperty({ example: 'VIP Table 1', required: false })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiProperty({ example: 4, minimum: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  capacity?: number;
}
