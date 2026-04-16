import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { memoryStorage } from 'multer';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiPayloadTooLargeResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ErrorResponseDto } from '../../common/swagger/error-response.dto';
import {
  LOCAL_UPLOAD_MAX_BYTES,
  localImageMulterFileFilter,
} from '../media/storage/local-storage.service';
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

  @Post(':id/image')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Upload product image (jpg / png / webp, max 5MB)',
    description:
      'Stores the file under `/uploads` and sets `product.imageUrl` to the public path (e.g. `/uploads/uuid.jpg`).',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'JPEG, PNG, or WebP',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT', type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: 'JWT without admin role', type: ErrorResponseDto })
  @ApiOkResponse({ type: ProductEntity, description: 'Product with updated imageUrl' })
  @ApiResponse({ status: 200, description: 'OK', type: ProductEntity })
  @ApiBadRequestResponse({
    description: 'Missing file, wrong type, or empty buffer',
    type: ErrorResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'Unknown product id', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Not found', type: ErrorResponseDto })
  @ApiPayloadTooLargeResponse({
    description: 'File exceeds 5 MB',
    type: ErrorResponseDto,
  })
  @ApiResponse({ status: 413, description: 'Payload too large', type: ErrorResponseDto })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error',
    type: ErrorResponseDto,
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: LOCAL_UPLOAD_MAX_BYTES },
      fileFilter: localImageMulterFileFilter,
    }),
  )
  async uploadProductImage(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<ProductEntity> {
    if (!file) {
      throw new BadRequestException(
        'Field "file" is required (multipart/form-data).',
      );
    }
    return this.productsService.uploadProductImage(id, file);
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
