import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AppliedVolumeTierEntity {
  @ApiProperty({ example: 12 })
  minQuantity!: number;

  @ApiProperty({ example: 0.05, description: 'Fraction off unit price (e.g. 0.05 = 5%)' })
  discountRate!: number;
}

export class PriceQuoteResponseEntity {
  @ApiProperty()
  productId!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty({ description: 'Catalog unit price before volume discount' })
  basePrice!: number;

  @ApiProperty({
    example: 0.1,
    description: 'Applied discount rate (0 if no tier matches quantity)',
  })
  appliedDiscountRate!: number;

  @ApiPropertyOptional({
    type: AppliedVolumeTierEntity,
    nullable: true,
    description: 'Volume tier that produced appliedDiscountRate (null if none)',
  })
  appliedTier!: AppliedVolumeTierEntity | null;

  @ApiProperty({ description: 'Unit price after applying the best applicable tier' })
  unitPrice!: number;

  @ApiProperty({ description: 'quantity × unitPrice (2 decimal places)' })
  totalPrice!: number;
}
