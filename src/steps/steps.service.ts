import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateStepDto } from './dto/create-step.dto';
import { UpdateStepDto } from './dto/update-step.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class StepsService {
  constructor(private prismaService: PrismaService) {}

  async findByProject(projectId: number, pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prismaService.step.findMany({
        where: { projectId },
        skip,
        take: limit,
        orderBy: { order: 'asc' },
      }),
      this.prismaService.step.count({ where: { projectId } }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const step = await this.prismaService.step.findUnique({ where: { id } });
    if (!step) throw new NotFoundException(`Étape ${id} introuvable`);
    return step;
  }

  create(dto: CreateStepDto) {
    return this.prismaService.step.create({
      data: dto,
    });
  }

  async update(id: number, dto: UpdateStepDto) {
    await this.findOne(id);
    return this.prismaService.step.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prismaService.step.delete({ where: { id } });
  }
}