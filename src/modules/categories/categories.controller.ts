import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiJwtAdminErrorDocs } from '../../common/swagger/admin-api.decorators';
import { ErrorResponseDto } from '../../common/swagger/error-response.dto';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryEntity } from './entities/category.entity';

@ApiTags('categories')
@ApiBearerAuth('JWT-auth')
@ApiJwtAdminErrorDocs()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all categories' })
  @ApiOkResponse({ type: CategoryEntity, isArray: true, description: 'Alphabetical list' })
  @ApiResponse({
    status: 200,
    description: 'OK',
    type: CategoryEntity,
    isArray: true,
  })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error',
    type: ErrorResponseDto,
  })
  findAll(): Promise<CategoryEntity[]> {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one category by id' })
  @ApiOkResponse({ type: CategoryEntity })
  @ApiResponse({ status: 200, description: 'OK', type: CategoryEntity })
  @ApiBadRequestResponse({
    description: '`id` is not a valid UUID v4',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Category id not found', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Not found', type: ErrorResponseDto })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error',
    type: ErrorResponseDto,
  })
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<CategoryEntity> {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a category' })
  @ApiCreatedResponse({ type: CategoryEntity, description: 'Category created' })
  @ApiResponse({ status: 201, description: 'Created', type: CategoryEntity })
  @ApiBadRequestResponse({ description: 'Validation failed', type: ErrorResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request', type: ErrorResponseDto })
  @ApiConflictResponse({
    description: 'Category name already exists (unique constraint / P2002)',
    type: ErrorResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Conflict', type: ErrorResponseDto })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error',
    type: ErrorResponseDto,
  })
  create(@Body() dto: CreateCategoryDto): Promise<CategoryEntity> {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiOkResponse({ type: CategoryEntity })
  @ApiResponse({ status: 200, description: 'OK', type: CategoryEntity })
  @ApiBadRequestResponse({
    description: 'Invalid UUID, empty body, or validation failed',
    type: ErrorResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'Category id not found', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Not found', type: ErrorResponseDto })
  @ApiConflictResponse({ description: 'New name already taken', type: ErrorResponseDto })
  @ApiResponse({ status: 409, description: 'Conflict', type: ErrorResponseDto })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error',
    type: ErrorResponseDto,
  })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryEntity> {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a category' })
  @ApiNoContentResponse({ description: 'Category removed' })
  @ApiResponse({ status: 204, description: 'No content' })
  @ApiBadRequestResponse({
    description: 'Invalid UUID or category still has products (FK / P2003)',
    type: ErrorResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'Category id not found', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Not found', type: ErrorResponseDto })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error',
    type: ErrorResponseDto,
  })
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    await this.categoriesService.remove(id);
  }
}
