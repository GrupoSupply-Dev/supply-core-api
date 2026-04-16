import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { ErrorResponseDto } from './common/swagger/error-response.dto';

@ApiTags('app')
@ApiBearerAuth('JWT-auth')
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT', type: ErrorResponseDto })
@ApiForbiddenResponse({ description: 'JWT without admin role', type: ErrorResponseDto })
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Root greeting (protected)' })
  @ApiOkResponse({ description: 'Plain text greeting', schema: { type: 'string', example: 'Hello World!' } })
  @ApiResponse({
    status: 200,
    description: 'OK',
    schema: { type: 'string', example: 'Hello World!' },
  })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error',
    type: ErrorResponseDto,
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
