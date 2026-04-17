import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderCustomerEntity {
  @ApiPropertyOptional({ nullable: true })
  email!: string | null;

  @ApiPropertyOptional({ nullable: true })
  name!: string | null;

  @ApiPropertyOptional({ nullable: true })
  phone!: string | null;
}

export class OrderShippingEntity {
  @ApiProperty()
  line1!: string;

  @ApiProperty()
  city!: string;

  @ApiPropertyOptional({ nullable: true })
  postalCode!: string | null;

  @ApiProperty()
  country!: string;
}

export class OrderLineItemEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  unitPrice!: number;

  @ApiProperty()
  productName!: string;

  @ApiProperty()
  productSku!: string;
}

export class OrderEntity {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional({ nullable: true })
  idempotencyKey!: string | null;

  @ApiProperty({ example: 'received' })
  status!: string;

  @ApiProperty({ type: OrderCustomerEntity })
  customer!: OrderCustomerEntity;

  @ApiProperty({ type: OrderShippingEntity })
  shipping!: OrderShippingEntity;

  @ApiProperty({ type: [OrderLineItemEntity] })
  lineItems!: OrderLineItemEntity[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
