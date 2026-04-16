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
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { MediaService } from './media.service';
import { UploadedImageEntity } from './entities/uploaded-image.entity';

@ApiTags('media')
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
  @ApiCreatedResponse({ type: UploadedImageEntity })
  @ApiBadRequestResponse({
    description: 'Missing file, wrong type, or file too large (max 5MB)',
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
