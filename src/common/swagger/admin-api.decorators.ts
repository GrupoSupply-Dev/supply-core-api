import { applyDecorators } from '@nestjs/common';
import { ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from './error-response.dto';

/** Standard 401/403 bodies for JWT + admin-only routes (use at controller level). */
export function ApiJwtAdminErrorDocs(): MethodDecorator & ClassDecorator {
  return applyDecorators(
    ApiUnauthorizedResponse({
      description: 'Missing `Authorization: Bearer <token>` or invalid/expired JWT',
      type: ErrorResponseDto,
    }),
    ApiForbiddenResponse({
      description: 'Valid JWT but `role` is not `admin`',
      type: ErrorResponseDto,
    }),
  );
}
