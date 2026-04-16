import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategorySummaryEntity {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'Electronics' })
  name!: string;
}

export class VolumeDiscountEntity {
  @ApiProperty({ example: '660e8400-e29b-41d4-a716-446655440001' })
  id!: string;

  @ApiProperty({ example: 12 })
  minQuantity!: number;

  @ApiProperty({ example: 0.1, description: 'Fraction off (0.1 = 10%)' })
  discountRate!: number;

  @ApiProperty({ example: '770e8400-e29b-41d4-a716-446655440002' })
  productId!: string;
}

export class ProductEntity {
  @ApiProperty({ example: '770e8400-e29b-41d4-a716-446655440002' })
  id!: string;

  @ApiProperty({ example: 'Corporate Laptop' })
  name!: string;

  @ApiProperty({ example: 'SKU-LAP-001' })
  sku!: string;

  @ApiPropertyOptional({ example: '15-inch display' })
  description?: string | null;

  @ApiProperty({ example: 2499.99 })
  basePrice!: number;

  @ApiProperty({ example: 100 })
  stock!: number;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/laptop.png' })
  imageUrl?: string | null;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  categoryId!: string;

  @ApiProperty({ type: CategorySummaryEntity })
  category!: CategorySummaryEntity;

  @ApiProperty({ type: VolumeDiscountEntity, isArray: true })
  volumeDiscounts!: VolumeDiscountEntity[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
