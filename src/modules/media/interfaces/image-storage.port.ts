import type { Express } from 'express';

export type ImageStorageProvider = 'local' | 'cloudinary';

export interface StoredImage {
  provider: ImageStorageProvider;
  /** Public URL path the browser can request (e.g. /uploads/abc.jpg). */
  publicUrl: string;
  /** Filename on disk or remote key. */
  storedFilename: string;
}

/**
 * Abstraction so you can swap local disk for Cloudinary (or S3) without changing controllers.
 */
export interface ImageStoragePort {
  saveUploadedImage(file: Express.Multer.File): Promise<StoredImage>;
}

export const IMAGE_STORAGE = Symbol('IMAGE_STORAGE');
