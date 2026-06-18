import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WaiterLoginDto {
  @ApiProperty({ example: '1234', description: '4-digit PIN assigned to the waiter by admin' })
  @IsNotEmpty()
  @IsString()
  pin: string;

  @ApiProperty({ example: 'uuid-of-branch', description: 'Branch ID the waiter belongs to' })
  @IsNotEmpty()
  @IsUUID()
  branchId: string;
}
