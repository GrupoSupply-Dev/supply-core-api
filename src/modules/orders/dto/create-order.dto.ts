import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateOrderCustomerDto {
  @ApiPropertyOptional({ example: 'buyer@example.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @ApiPropertyOptional({ example: 'Jane Buyer' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ example: '+1-555-0100' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;
}

export class CreateOrderShippingDto {
  @ApiProperty({ example: '123 Industrial Way' })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  line1!: string;

  @ApiProperty({ example: 'Austin' })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  city!: string;

  @ApiPropertyOptional({ example: '78701' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  postalCode?: string;

  @ApiPropertyOptional({
    example: 'US',
    description: 'ISO-like country code; defaults to US when omitted',
    maxLength: 2,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  country?: string;
}

export class CreateOrderLineItemDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  productId!: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({
    example: 99.5,
    description: 'Agreed unit price (e.g. from POST /discounts/quote or batch)',
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  unitPrice!: number;
}

export class CreateOrderDto {
  @ApiPropertyOptional({
    maxLength: 128,
    description:
      'Optional idempotency key; duplicate POST with the same key returns the existing order (same 201 payload).',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  idempotencyKey?: string;

  @ApiProperty({ type: CreateOrderCustomerDto })
  @ValidateNested()
  @Type(() => CreateOrderCustomerDto)
  customer!: CreateOrderCustomerDto;

  @ApiProperty({ type: CreateOrderShippingDto })
  @ValidateNested()
  @Type(() => CreateOrderShippingDto)
  shipping!: CreateOrderShippingDto;

  @ApiProperty({ type: [CreateOrderLineItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderLineItemDto)
  lineItems!: CreateOrderLineItemDto[];
}
