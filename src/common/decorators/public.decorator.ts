import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Skips JWT + admin checks (storefront catalog, quotes, checkout). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
