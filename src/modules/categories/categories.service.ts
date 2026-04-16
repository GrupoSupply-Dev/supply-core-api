import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
    try {
      const row = await this.prisma.category.create({
        data: { name: dto.name.trim() },
      });
      return this.mapToEntity(row);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `A category named "${dto.name.trim()}" already exists. Use another name or update the existing category.`,
        );
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryEntity> {
    await this.findOne(id);
    if (dto.name === undefined) {
      throw new BadRequestException(
        'Provide at least one field to update (e.g. name).',
      );
    }
    try {
      const row = await this.prisma.category.update({
        where: { id },
        data: { name: dto.name.trim() },
      });
      return this.mapToEntity(row);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `A category named "${dto.name!.trim()}" already exists.`,
        );
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    try {
      await this.prisma.category.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          `Cannot delete category "${id}" because one or more products still reference it. Reassign or delete those products first.`,
        );
      }
      throw error;
    }
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
