import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderEntity } from './entities/order.entity';

const orderInclude = {
  lineItems: true,
} satisfies Prisma.OrderInclude;

type OrderWithLines = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto): Promise<OrderEntity> {
    if (dto.idempotencyKey) {
      const existing = await this.prisma.order.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
        include: orderInclude,
      });
      if (existing) {
        return this.mapToEntity(existing);
      }
    }

    const productIds = [...new Set(dto.lineItems.map((l) => l.productId))];
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    if (products.length !== productIds.length) {
      const found = new Set(products.map((p) => p.id));
      const missing = productIds.filter((id) => !found.has(id));
      throw new NotFoundException(`Unknown product id(s): ${missing.join(', ')}`);
    }

    const byId = new Map(products.map((p) => [p.id, p]));
    for (const line of dto.lineItems) {
      const p = byId.get(line.productId)!;
      if (line.quantity > p.stock) {
        throw new BadRequestException(
          `Insufficient stock for product "${p.name}" (${p.sku}): requested ${line.quantity}, available ${p.stock}.`,
        );
      }
    }

    try {
      const created = await this.prisma.order.create({
        data: {
          idempotencyKey: dto.idempotencyKey ?? null,
          customerEmail: dto.customer.email ?? null,
          customerName: dto.customer.name ?? null,
          customerPhone: dto.customer.phone ?? null,
          shipLine1: dto.shipping.line1,
          shipCity: dto.shipping.city,
          shipPostalCode: dto.shipping.postalCode ?? null,
          shipCountry: dto.shipping.country ?? 'US',
          lineItems: {
            create: dto.lineItems.map((li) => {
              const p = byId.get(li.productId)!;
              return {
                productId: li.productId,
                quantity: li.quantity,
                unitPrice: li.unitPrice,
                productName: p.name,
                productSku: p.sku,
              };
            }),
          },
        },
        include: orderInclude,
      });
      return this.mapToEntity(created);
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002' &&
        dto.idempotencyKey
      ) {
        const race = await this.prisma.order.findUnique({
          where: { idempotencyKey: dto.idempotencyKey },
          include: orderInclude,
        });
        if (race) {
          return this.mapToEntity(race);
        }
      }
      throw e;
    }
  }

  private mapToEntity(row: OrderWithLines): OrderEntity {
    return {
      id: row.id,
      idempotencyKey: row.idempotencyKey,
      status: row.status,
      customer: {
        email: row.customerEmail,
        name: row.customerName,
        phone: row.customerPhone,
      },
      shipping: {
        line1: row.shipLine1,
        city: row.shipCity,
        postalCode: row.shipPostalCode,
        country: row.shipCountry,
      },
      lineItems: row.lineItems.map((li) => ({
        id: li.id,
        productId: li.productId,
        quantity: li.quantity,
        unitPrice: li.unitPrice,
        productName: li.productName,
        productSku: li.productSku,
      })),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
