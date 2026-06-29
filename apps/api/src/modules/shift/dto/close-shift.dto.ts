import { IsInt, Min, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CloseShiftDto {
  @ApiProperty({ example: 245000, description: 'Actual cash counted in kobo' })
  @IsInt()
  @Min(0)
  actual_cash_kobo: number;

  @ApiPropertyOptional({ example: 'Short by ₦500' })
  @IsOptional()
  @IsString()
  note?: string;
}
