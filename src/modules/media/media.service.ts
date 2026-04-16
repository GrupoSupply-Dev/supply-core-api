import { Inject, Injectable } from '@nestjs/common';
import type { Express } from 'express';
import {
  IMAGE_STORAGE,
  ImageStoragePort,
  StoredImage,
} from './interfaces/image-storage.port';

@Injectable()
export class MediaService {
  constructor(
    @Inject(IMAGE_STORAGE)
    private readonly imageStorage: ImageStoragePort,
  ) {}

  saveUploadedImage(file: Express.Multer.File): Promise<StoredImage> {
    return this.imageStorage.saveUploadedImage(file);
  }
}
