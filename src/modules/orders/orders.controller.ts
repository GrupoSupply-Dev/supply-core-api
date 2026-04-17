import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ErrorResponseDto } from '../../common/swagger/error-response.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderEntity } from './entities/order.entity';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create an order (checkout)',
    description:
      'Accepts agreed line-level unit prices (from discount quotes). Optional idempotencyKey deduplicates retries.',
  })
  @ApiCreatedResponse({ type: OrderEntity })
  @ApiResponse({ status: 201, description: 'Created', type: OrderEntity })
  @ApiBadRequestResponse({
    description: 'Validation error or insufficient stock',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Unknown product id on a line item', type: ErrorResponseDto })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error',
    type: ErrorResponseDto,
  })
  create(@Body() dto: CreateOrderDto): Promise<OrderEntity> {
    return this.ordersService.create(dto);
  }
}
