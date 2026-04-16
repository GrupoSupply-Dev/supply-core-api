import { ApiProperty } from '@nestjs/swagger';

export class CategoryEntity {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'Válvulas' })
  name!: string;

  @ApiProperty({ example: '2026-01-01T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T10:00:00.000Z' })
  updatedAt!: Date;
}
