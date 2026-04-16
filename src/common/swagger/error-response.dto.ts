import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Typical NestJS + global filter error JSON (also used for Prisma-mapped errors). */
export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({ example: 'Bad Request' })
  error!: string;

  @ApiProperty({
    description: 'Human-readable message or validation messages',
    example: 'Invalid UUID',
  })
  message!: string | string[];

  @ApiPropertyOptional({ example: '/categories/not-a-uuid' })
  path?: string;

  @ApiPropertyOptional({
    example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    description: 'Present when LoggingInterceptor ran (correlation)',
  })
  requestId?: string;

  @ApiPropertyOptional({
    description: 'Prisma error code when mapped from database',
    example: 'P2002',
  })
  code?: string;

  @ApiPropertyOptional({
    description: 'Unique field targets for P2002',
    example: ['sku'],
    isArray: true,
    type: String,
  })
  fields?: string[];
}
