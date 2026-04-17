import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/** Allowed sort keys (stable ordering for storefront). */
export const PRODUCT_LIST_SORT = [
  'createdAt_desc',
  'createdAt_asc',
  'name_asc',
  'name_desc',
  'basePrice_asc',
  'basePrice_desc',
] as const;

export type ProductListSort = (typeof PRODUCT_LIST_SORT)[number];

export class ListProductsQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @ApiPropertyOptional({
    description:
      'Case-insensitive search across product name, SKU, description, and category name',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  @ApiPropertyOptional({
    enum: PRODUCT_LIST_SORT,
    default: 'createdAt_desc',
    description: 'Stable sort for catalog listing',
  })
  @IsOptional()
  @IsString()
  @IsIn([...PRODUCT_LIST_SORT])
  sort?: ProductListSort;

  @ApiPropertyOptional({ format: 'uuid', description: 'Filter by category id' })
  @IsOptional()
  @IsUUID('4')
  categoryId?: string;
}
