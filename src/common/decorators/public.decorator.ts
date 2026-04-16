import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Skips JWT + admin checks (use sparingly; catalog rule: only GET /products is public). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
