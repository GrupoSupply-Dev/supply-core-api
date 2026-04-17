import { ApiProperty } from '@nestjs/swagger';
import { PriceQuoteResponseEntity } from './price-quote-response.entity';

export class BatchQuoteResponseEntity {
  @ApiProperty({ type: [PriceQuoteResponseEntity] })
  quotes!: PriceQuoteResponseEntity[];
}
