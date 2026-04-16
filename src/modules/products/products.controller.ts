import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductEntity } from './entities/product.entity';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List all products (with category and volume discounts)' })
  @ApiOkResponse({ type: ProductEntity, isArray: true })
  findAll(): Promise<ProductEntity[]> {
    return this.productsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a product (optional nested volume discounts)' })
  @ApiCreatedResponse({ type: ProductEntity })
  @ApiBadRequestResponse({
    description:
      'Validation error, unknown categoryId, duplicate SKU, or duplicate volume tier minQuantity',
  })
  create(@Body() createProductDto: CreateProductDto): Promise<ProductEntity> {
    return this.productsService.create(createProductDto);
  }
}
