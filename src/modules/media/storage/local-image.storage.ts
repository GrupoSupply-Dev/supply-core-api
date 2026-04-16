import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import type { Express } from 'express';
import {
  ImageStoragePort,
  StoredImage,
} from '../interfaces/image-storage.port';

const ALLOWED_MIME = new Map<string, string>([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);

const MAX_BYTES = 5 * 1024 * 1024;

@Injectable()
export class LocalImageStorageService implements ImageStoragePort {
  private readonly uploadRoot = join(process.cwd(), 'uploads');

  async saveUploadedImage(file: Express.Multer.File): Promise<StoredImage> {
    if (!file?.buffer?.length) {
      throw new BadRequestException('File is empty or missing.');
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestException(
        `File too large. Maximum size is ${MAX_BYTES / (1024 * 1024)} MB.`,
      );
    }

    const ext = ALLOWED_MIME.get(file.mimetype);
    if (!ext) {
      throw new BadRequestException(
        `Unsupported file type "${file.mimetype}". Allowed: ${[
          ...ALLOWED_MIME.keys(),
        ].join(', ')}.`,
      );
    }

    await mkdir(this.uploadRoot, { recursive: true });

    const storedFilename = `${randomUUID()}.${ext}`;
    const absolutePath = join(this.uploadRoot, storedFilename);
    await writeFile(absolutePath, file.buffer);

    return {
      provider: 'local',
      publicUrl: `/uploads/${storedFilename}`,
      storedFilename,
    };
  }
}
