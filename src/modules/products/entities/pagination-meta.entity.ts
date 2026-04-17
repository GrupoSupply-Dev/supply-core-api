import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaEntity {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  pageSize!: number;

  @ApiProperty({ example: 142 })
  total!: number;

  @ApiProperty({ example: 8 })
  totalPages!: number;

  @ApiProperty({ example: 'createdAt_desc' })
  sort!: string;
}
