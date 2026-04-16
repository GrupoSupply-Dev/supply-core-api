import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryEntity } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CategoryEntity[]> {
    const rows = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return rows.map((c) => this.mapToEntity(c));
  }

  async findOne(id: string): Promise<CategoryEntity> {
    const row = await this.prisma.category.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Category with id "${id}" was not found.`);
    }
    return this.mapToEntity(row);
  }

  async create(dto: CreateCategoryDto): Promise<CategoryEntity> {
    const row = await this.prisma.category.create({
      data: { name: dto.name.trim() },
    });
    return this.mapToEntity(row);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryEntity> {
    await this.findOne(id);
    if (dto.name === undefined) {
      throw new BadRequestException(
        'Provide at least one field to update (e.g. name).',
      );
    }
    const row = await this.prisma.category.update({
      where: { id },
      data: { name: dto.name.trim() },
    });
    return this.mapToEntity(row);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.category.delete({ where: { id } });
  }

  private mapToEntity(row: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }): CategoryEntity {
    return {
      id: row.id,
      name: row.name,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
