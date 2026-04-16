import { Module } from '@nestjs/common';
import { IMAGE_STORAGE } from './interfaces/image-storage.port';
import { LocalStorageService } from './storage/local-storage.service';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  controllers: [MediaController],
  providers: [
    LocalStorageService,
    {
      provide: IMAGE_STORAGE,
      useExisting: LocalStorageService,
    },
    MediaService,
  ],
  exports: [MediaService, IMAGE_STORAGE, LocalStorageService],
})
export class MediaModule {}
