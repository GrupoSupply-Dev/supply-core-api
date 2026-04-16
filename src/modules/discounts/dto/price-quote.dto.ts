import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsUUID, Min } from 'class-validator';

export class PriceQuoteDto {
  @ApiProperty({
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Product id to price',
  })
  @IsUUID('4')
  productId!: string;

  @ApiProperty({ example: 24, minimum: 1, description: 'Units to quote' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}
