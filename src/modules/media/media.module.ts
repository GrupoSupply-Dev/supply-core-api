import { Module } from '@nestjs/common';
import { IMAGE_STORAGE } from './interfaces/image-storage.port';
import { LocalImageStorageService } from './storage/local-image.storage';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  controllers: [MediaController],
  providers: [
    LocalImageStorageService,
    {
      provide: IMAGE_STORAGE,
      useExisting: LocalImageStorageService,
    },
    MediaService,
  ],
  exports: [MediaService, IMAGE_STORAGE],
})
export class MediaModule {}
