import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PriceQuoteDto } from './dto/price-quote.dto';
import { PriceQuoteResponseEntity } from './entities/price-quote-response.entity';

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

@Injectable()
export class DiscountsService {
  constructor(private readonly prisma: PrismaService) {}

  async quotePrice(dto: PriceQuoteDto): Promise<PriceQuoteResponseEntity> {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      include: { volumeDiscounts: true },
    });

    if (!product) {
      throw new NotFoundException(
        `Product with id "${dto.productId}" was not found.`,
      );
    }

    const applicable = product.volumeDiscounts.filter(
      (t) => dto.quantity >= t.minQuantity,
    );

    let appliedDiscountRate = 0;
    let appliedTier: PriceQuoteResponseEntity['appliedTier'] = null;

    if (applicable.length > 0) {
      const best = applicable.reduce((prev, cur) =>
        cur.discountRate > prev.discountRate ? cur : prev,
      );
      appliedDiscountRate = best.discountRate;
      appliedTier = {
        minQuantity: best.minQuantity,
        discountRate: best.discountRate,
      };
    }

    const unitPrice = roundMoney(product.basePrice * (1 - appliedDiscountRate));
    const totalPrice = roundMoney(unitPrice * dto.quantity);

    return {
      productId: product.id,
      quantity: dto.quantity,
      basePrice: product.basePrice,
      appliedDiscountRate,
      appliedTier,
      unitPrice,
      totalPrice,
    };
  }
}
