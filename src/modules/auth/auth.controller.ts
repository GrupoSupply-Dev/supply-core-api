import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
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
  @ApiOkResponse({ type: LoginResponseEntity })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials or misconfigured server' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  login(@Body() dto: LoginDto): Promise<LoginResponseEntity> {
    return this.authService.login(dto);
  }
}
