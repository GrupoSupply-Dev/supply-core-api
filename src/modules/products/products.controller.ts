import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductEntity } from './entities/product.entity';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all products (with category and volume discounts)' })
  @ApiOkResponse({ type: ProductEntity, isArray: true })
  findAll(): Promise<ProductEntity[]> {
    return this.productsService.findAll();
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a product (optional nested volume discounts)' })
  @ApiCreatedResponse({ type: ProductEntity })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Valid JWT but not an admin' })
  @ApiBadRequestResponse({
    description:
      'Validation error, unknown categoryId, duplicate SKU, or duplicate volume tier minQuantity',
  })
  create(@Body() createProductDto: CreateProductDto): Promise<ProductEntity> {
    return this.productsService.create(createProductDto);
  }
}
