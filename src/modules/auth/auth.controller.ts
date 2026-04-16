import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ErrorResponseDto } from '../../common/swagger/error-response.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseEntity } from './entities/login-response.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtain JWT (admin credentials from server env)' })
  @ApiOkResponse({ type: LoginResponseEntity, description: 'JWT issued' })
  @ApiResponse({ status: 200, description: 'OK', type: LoginResponseEntity })
  @ApiUnauthorizedResponse({
    description: 'Invalid email/password or missing ADMIN_* env configuration',
    type: ErrorResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed (email/password shape)', type: ErrorResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request', type: ErrorResponseDto })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error',
    type: ErrorResponseDto,
  })
  login(@Body() dto: LoginDto): Promise<LoginResponseEntity> {
    return this.authService.login(dto);
  }
}
