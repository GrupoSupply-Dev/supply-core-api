import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import type { Express } from 'express';
import type { Request } from 'express';
import {
  ImageStoragePort,
  StoredImage,
} from '../interfaces/image-storage.port';

/** Allowed MIME types → file extension on disk (jpg, png, webp). */
export const LOCAL_IMAGE_MIME_TO_EXT = new Map<string, string>([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);

export const LOCAL_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;

export const localImageMulterFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
): void => {
  if (LOCAL_IMAGE_MIME_TO_EXT.has(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(
    new BadRequestException(
      'Only JPEG (.jpg), PNG (.png), and WebP (.webp) images are allowed.',
    ),
    false,
  );
};

/**
 * Persists files under `process.cwd()/uploads` and returns public paths under `/uploads/...`.
 * Implements {@link ImageStoragePort} so you can swap for cloud storage later.
 */
@Injectable()
export class LocalStorageService implements ImageStoragePort {
  private readonly uploadRoot = join(process.cwd(), 'uploads');

  async saveUploadedImage(file: Express.Multer.File): Promise<StoredImage> {
    if (!file?.buffer?.length) {
      throw new BadRequestException('File is empty or missing.');
    }
    if (file.size > LOCAL_UPLOAD_MAX_BYTES) {
      throw new BadRequestException(
        `File too large. Maximum size is ${LOCAL_UPLOAD_MAX_BYTES / (1024 * 1024)} MB.`,
      );
    }

    const ext = LOCAL_IMAGE_MIME_TO_EXT.get(file.mimetype);
    if (!ext) {
      throw new BadRequestException(
        `Unsupported file type "${file.mimetype}". Allowed: ${[
          ...LOCAL_IMAGE_MIME_TO_EXT.keys(),
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
