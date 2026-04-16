import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductEntity } from './entities/product.entity';

const productInclude = {
  category: true,
  volumeDiscounts: true,
} satisfies Prisma.ProductInclude;

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ProductEntity[]> {
    const rows = await this.prisma.product.findMany({
      include: productInclude,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.mapToEntity(row));
  }

  async create(dto: CreateProductDto): Promise<ProductEntity> {
    const tiers = dto.volumeDiscounts ?? [];
    const minQuantities = tiers.map((t) => t.minQuantity);
    if (new Set(minQuantities).size !== minQuantities.length) {
      throw new BadRequestException(
        'volumeDiscounts must not contain duplicate minQuantity values',
      );
    }

    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: [
          `No category exists with id "${dto.categoryId}".`,
          'Create the category first (POST /categories) or send a valid categoryId from GET /categories.',
        ],
      });
    }

    try {
      const created = await this.prisma.product.create({
        data: {
          name: dto.name,
          sku: dto.sku,
          description: dto.description,
          basePrice: dto.basePrice,
          stock: dto.stock ?? 0,
          imageUrl: dto.imageUrl,
          categoryId: dto.categoryId,
          volumeDiscounts:
            tiers.length > 0
              ? {
                  create: tiers.map((t) => ({
                    minQuantity: t.minQuantity,
                    discountRate: t.discountRate,
                  })),
                }
              : undefined,
        },
        include: productInclude,
      });
      return this.mapToEntity(created);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'A product with this SKU already exists (or duplicate volume tier).',
        );
      }
      throw error;
    }
  }

  private mapToEntity(row: ProductWithRelations): ProductEntity {
    return {
      id: row.id,
      name: row.name,
      sku: row.sku,
      description: row.description,
      basePrice: row.basePrice,
      stock: row.stock,
      imageUrl: row.imageUrl,
      categoryId: row.categoryId,
      category: {
        id: row.category.id,
        name: row.category.name,
      },
      volumeDiscounts: row.volumeDiscounts.map((d) => ({
        id: d.id,
        minQuantity: d.minQuantity,
        discountRate: d.discountRate,
        productId: d.productId,
      })),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
