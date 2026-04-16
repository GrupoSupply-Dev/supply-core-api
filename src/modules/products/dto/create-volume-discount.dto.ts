import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class CreateVolumeDiscountDto {
  @ApiProperty({ example: 12, description: 'Minimum units for this tier' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minQuantity!: number;

  @ApiProperty({
    example: 0.1,
    description: 'Discount as a fraction of the price (e.g. 0.1 = 10%)',
  })
  @IsNotEmpty()
  @Type(() => Number)
  @Min(0)
  @Max(1)
  discountRate!: number;
}
