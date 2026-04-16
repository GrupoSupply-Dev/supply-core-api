import {
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
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
  ApiOperation,
  ApiPayloadTooLargeResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiJwtAdminErrorDocs } from '../../common/swagger/admin-api.decorators';
import { ErrorResponseDto } from '../../common/swagger/error-response.dto';
import { MediaService } from './media.service';
import { UploadedImageEntity } from './entities/uploaded-image.entity';

@ApiTags('media')
@ApiBearerAuth('JWT-auth')
@ApiJwtAdminErrorDocs()
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('images')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Upload an image (stored on local disk; swap storage via DI for cloud)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary', description: 'JPEG, PNG, or WebP' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT', type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: 'JWT without admin role', type: ErrorResponseDto })
  @ApiCreatedResponse({ type: UploadedImageEntity, description: 'File stored under /uploads' })
  @ApiResponse({ status: 201, description: 'Created', type: UploadedImageEntity })
  @ApiBadRequestResponse({
    description: 'Missing file, unsupported type, or empty buffer',
    type: ErrorResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request', type: ErrorResponseDto })
  @ApiPayloadTooLargeResponse({
    description: 'File exceeds 5 MB (Multer limit)',
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
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<UploadedImageEntity> {
    if (!file) {
      throw new BadRequestException(
        'Field "file" is required (multipart/form-data).',
      );
    }
    return this.mediaService.saveUploadedImage(file);
  }
}
