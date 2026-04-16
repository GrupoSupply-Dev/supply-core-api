import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiJwtAdminErrorDocs } from '../../common/swagger/admin-api.decorators';
import { ErrorResponseDto } from '../../common/swagger/error-response.dto';
import { DiscountsService } from './discounts.service';
import { PriceQuoteDto } from './dto/price-quote.dto';
import { PriceQuoteResponseEntity } from './entities/price-quote-response.entity';

@ApiTags('discounts')
@ApiBearerAuth('JWT-auth')
@ApiJwtAdminErrorDocs()
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Post('quote')
  @ApiOperation({
    summary: 'Quote final unit and line total for a quantity (volume tiers)',
    description:
      'Uses the highest applicable discountRate among tiers where quantity >= minQuantity.',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT', type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: 'JWT without admin role', type: ErrorResponseDto })
  @ApiOkResponse({ type: PriceQuoteResponseEntity })
  @ApiResponse({ status: 200, description: 'OK', type: PriceQuoteResponseEntity })
  @ApiBadRequestResponse({ description: 'Invalid body or validation error', type: ErrorResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'Unknown productId', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Not found', type: ErrorResponseDto })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error',
    type: ErrorResponseDto,
  })
  quote(@Body() dto: PriceQuoteDto): Promise<PriceQuoteResponseEntity> {
    return this.discountsService.quotePrice(dto);
  }
}
