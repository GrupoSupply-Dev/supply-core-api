import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CreateVolumeDiscountDto } from './create-volume-discount.dto';

export class CreateProductDto {
  @ApiProperty({ example: 'Corporate Laptop' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'SKU-LAP-001' })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  sku!: string;

  @ApiPropertyOptional({ example: '15-inch, 32GB RAM' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ example: 2499.99 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsPositive()
  basePrice!: number;

  @ApiPropertyOptional({ example: 100, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/laptop.png' })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  imageUrl?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description:
      'Must reference an existing category (see GET /categories). Invalid ids return 400.',
  })
  @IsNotEmpty()
  @IsUUID('4')
  categoryId!: string;

  @ApiPropertyOptional({
    type: [CreateVolumeDiscountDto],
    description: 'Optional volume discount tiers created with the product',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVolumeDiscountDto)
  volumeDiscounts?: CreateVolumeDiscountDto[];
}
