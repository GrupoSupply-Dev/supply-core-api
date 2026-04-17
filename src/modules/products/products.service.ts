import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Express } from 'express';
import { IMAGE_STORAGE, ImageStoragePort } from '../media/interfaces/image-storage.port';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsQueryDto, type ProductListSort } from './dto/list-products-query.dto';
import { PaginatedProductsEntity } from './entities/paginated-products.entity';
import { ProductEntity } from './entities/product.entity';

const productInclude = {
  category: true,
  volumeDiscounts: true,
} satisfies Prisma.ProductInclude;

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

function listOrderBy(sort: ProductListSort | undefined): Prisma.ProductOrderByWithRelationInput[] {
  const key = sort ?? 'createdAt_desc';
  switch (key) {
    case 'createdAt_asc':
      return [{ createdAt: 'asc' }, { id: 'asc' }];
    case 'name_asc':
      return [{ name: 'asc' }, { id: 'asc' }];
    case 'name_desc':
      return [{ name: 'desc' }, { id: 'asc' }];
    case 'basePrice_asc':
      return [{ basePrice: 'asc' }, { id: 'asc' }];
    case 'basePrice_desc':
      return [{ basePrice: 'desc' }, { id: 'asc' }];
    case 'createdAt_desc':
      return [{ createdAt: 'desc' }, { id: 'asc' }];
    default: {
      const _exhaustive: never = key;
      return _exhaustive;
    }
  }
}

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(IMAGE_STORAGE)
    private readonly imageStorage: ImageStoragePort,
  ) {}

  async findPaginated(query: ListProductsQueryDto): Promise<PaginatedProductsEntity> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sort = query.sort ?? 'createdAt_desc';
    const where: Prisma.ProductWhereInput = {};
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }
    if (query.search?.trim()) {
      const term = query.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { sku: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { category: { name: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: listOrderBy(sort),
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

    return {
      data: rows.map((row) => this.mapToEntity(row)),
      meta: {
        page,
        pageSize,
        total,
        totalPages,
        sort,
      },
    };
  }

  async findOneById(id: string): Promise<ProductEntity> {
    const row = await this.prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });
    if (!row) {
      throw new NotFoundException(`Product with id "${id}" was not found.`);
    }
    return this.mapToEntity(row);
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
  }

  async uploadProductImage(
    productId: string,
    file: Express.Multer.File,
  ): Promise<ProductEntity> {
    const existing = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!existing) {
      throw new NotFoundException(`Product with id "${productId}" was not found.`);
    }

    const stored = await this.imageStorage.saveUploadedImage(file);

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: { imageUrl: stored.publicUrl },
      include: productInclude,
    });
    return this.mapToEntity(updated);
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
