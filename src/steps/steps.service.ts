import { Injectable } from '@nestjs/common';
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

  create(dto: CreateStepDto) {
    return this.prismaService.step.create({
      data: dto,
    });
  }

  update(id: number, dto: UpdateStepDto) {
    return this.prismaService.step.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: number) {
    return this.prismaService.step.delete({
      where: { id },
    });
  }
}