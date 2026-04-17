import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaEntity } from './pagination-meta.entity';
import { ProductEntity } from './product.entity';

export class PaginatedProductsEntity {
  @ApiProperty({ type: [ProductEntity] })
  data!: ProductEntity[];

  @ApiProperty({ type: PaginationMetaEntity })
  meta!: PaginationMetaEntity;
}
