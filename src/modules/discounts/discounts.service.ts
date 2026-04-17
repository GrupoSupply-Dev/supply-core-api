import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PriceQuoteBatchDto } from './dto/price-quote-batch.dto';
import { PriceQuoteDto } from './dto/price-quote.dto';
import { BatchQuoteResponseEntity } from './entities/batch-quote-response.entity';
import { PriceQuoteResponseEntity } from './entities/price-quote-response.entity';

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

const productQuoteInclude = {
  volumeDiscounts: true,
} satisfies Prisma.ProductInclude;

type ProductWithTiers = Prisma.ProductGetPayload<{
  include: typeof productQuoteInclude;
}>;

@Injectable()
export class DiscountsService {
  constructor(private readonly prisma: PrismaService) {}

  async quotePrice(dto: PriceQuoteDto): Promise<PriceQuoteResponseEntity> {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      include: productQuoteInclude,
    });

    if (!product) {
      throw new NotFoundException(
        `Product with id "${dto.productId}" was not found.`,
      );
    }

    return this.computeQuote(product, dto.quantity);
  }

  async quotePriceBatch(dto: PriceQuoteBatchDto): Promise<BatchQuoteResponseEntity> {
    const ids = dto.items.map((i) => i.productId);
    const uniqueIds = [...new Set(ids)];
    const products = await this.prisma.product.findMany({
      where: { id: { in: uniqueIds } },
      include: productQuoteInclude,
    });
    if (products.length !== uniqueIds.length) {
      const found = new Set(products.map((p) => p.id));
      const missing = uniqueIds.filter((id) => !found.has(id));
      throw new NotFoundException(`Unknown product id(s): ${missing.join(', ')}`);
    }
    const map = new Map(products.map((p) => [p.id, p]));
    const quotes = dto.items.map((item) =>
      this.computeQuote(map.get(item.productId)!, item.quantity),
    );
    return { quotes };
  }

  private computeQuote(
    product: ProductWithTiers,
    quantity: number,
  ): PriceQuoteResponseEntity {
    const applicable = product.volumeDiscounts.filter(
      (t) => quantity >= t.minQuantity,
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
    const totalPrice = roundMoney(unitPrice * quantity);

    return {
      productId: product.id,
      quantity,
      basePrice: product.basePrice,
      appliedDiscountRate,
      appliedTier,
      unitPrice,
      totalPrice,
    };
  }
}
