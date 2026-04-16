import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ErrorResponseDto } from '../../common/swagger/error-response.dto';
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
  @ApiOkResponse({
    type: ProductEntity,
    isArray: true,
    description: 'Public catalog listing',
  })
  @ApiResponse({
    status: 200,
    description: 'OK',
    type: ProductEntity,
    isArray: true,
  })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error',
    type: ErrorResponseDto,
  })
  findAll(): Promise<ProductEntity[]> {
    return this.productsService.findAll();
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a product (optional nested volume discounts)' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT', type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: 'JWT without admin role', type: ErrorResponseDto })
  @ApiCreatedResponse({ type: ProductEntity, description: 'Product created' })
  @ApiResponse({ status: 201, description: 'Created', type: ProductEntity })
  @ApiBadRequestResponse({
    description:
      'Validation error, unknown categoryId, duplicate SKU / tier (P2002), or duplicate minQuantity in body',
    type: ErrorResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request', type: ErrorResponseDto })
  @ApiResponse({
    status: 409,
    description: 'Unique constraint (e.g. SKU) — see global error body',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error',
    type: ErrorResponseDto,
  })
  create(@Body() createProductDto: CreateProductDto): Promise<ProductEntity> {
    return this.productsService.create(createProductDto);
  }
}
