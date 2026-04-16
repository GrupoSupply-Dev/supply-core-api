import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DiscountsService } from './discounts.service';
import { PriceQuoteDto } from './dto/price-quote.dto';
import { PriceQuoteResponseEntity } from './entities/price-quote-response.entity';

@ApiTags('discounts')
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Post('quote')
  @ApiOperation({
    summary: 'Quote final unit and line total for a quantity (volume tiers)',
    description:
      'Uses the highest applicable discountRate among tiers where quantity >= minQuantity.',
  })
  @ApiOkResponse({ type: PriceQuoteResponseEntity })
  @ApiBadRequestResponse({ description: 'Invalid body or validation error' })
  @ApiNotFoundResponse({ description: 'Unknown productId' })
  quote(@Body() dto: PriceQuoteDto): Promise<PriceQuoteResponseEntity> {
    return this.discountsService.quotePrice(dto);
  }
}
