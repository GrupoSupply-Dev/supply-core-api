import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ErrorResponseDto } from '../../common/swagger/error-response.dto';
import { DiscountsService } from './discounts.service';
import { PriceQuoteBatchDto } from './dto/price-quote-batch.dto';
import { PriceQuoteDto } from './dto/price-quote.dto';
import { BatchQuoteResponseEntity } from './entities/batch-quote-response.entity';
import { PriceQuoteResponseEntity } from './entities/price-quote-response.entity';

@ApiTags('discounts')
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Public()
  @Post('quote')
  @ApiOperation({
    summary: 'Quote final unit and line total for a quantity (volume tiers)',
    description:
      'Uses the highest applicable discountRate among tiers where quantity >= minQuantity. Public for storefront cart.',
  })
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

  @Public()
  @Post('quote/batch')
  @ApiOperation({
    summary: 'Batch quote for multiple cart lines',
    description:
      'Same fields as POST /discounts/quote per line; `quotes` array matches request `items` order.',
  })
  @ApiOkResponse({ type: BatchQuoteResponseEntity })
  @ApiResponse({ status: 200, description: 'OK', type: BatchQuoteResponseEntity })
  @ApiBadRequestResponse({ description: 'Invalid body or validation error', type: ErrorResponseDto })
  @ApiNotFoundResponse({
    description: 'One or more product ids are unknown',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error',
    type: ErrorResponseDto,
  })
  quoteBatch(@Body() dto: PriceQuoteBatchDto): Promise<BatchQuoteResponseEntity> {
    return this.discountsService.quotePriceBatch(dto);
  }
}
