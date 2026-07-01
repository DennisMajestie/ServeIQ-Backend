import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePosTerminalDto {
  @ApiProperty({ example: 'POS 1', description: 'Label for the POS terminal' })
  @IsNotEmpty()
  @IsString()
  label: string;

  @ApiProperty({ example: true, description: 'Whether the terminal is active', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
