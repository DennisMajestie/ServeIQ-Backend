
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuItemDto {
  @ApiProperty({ example: 'Heineken' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Drinks' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 5000, description: 'Price in kobo (1 NGN = 100 kobo)' })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price_kobo: number;

  @ApiProperty({ example: 'bottle', required: false })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiProperty({ example: 'SKU123', required: false })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({ example: 'BAR123', required: false })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsString()
  @IsOptional()
  image_url?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  is_available?: boolean;
}
