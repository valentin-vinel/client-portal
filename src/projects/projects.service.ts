import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ProjectsService {
  constructor(private prismaService: PrismaService) {}

  async findAll(userId: number, role: string, pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const where = role === 'admin' ? {} : { userId };

    const [data, total] = await Promise.all([
      this.prismaService.project.findMany({
        where,
        skip,
        take: limit,
        include: { user: { select: { id: true, email: true, role: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.project.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const project = await this.prismaService.project.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, role: true } },
        steps: { orderBy: { order: 'asc' } },
        reports: { orderBy: { createdAt: 'desc' } },
        documents: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!project) throw new NotFoundException(`Projet ${id} introuvable`);

    return project;
  }

  create(dto: CreateProjectDto) {
    return this.prismaService.project.create({
      data: dto,
    });
  }

  async update(id: number, dto: UpdateProjectDto) {
    await this.findOne(id);
    return this.prismaService.project.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prismaService.project.delete({ where: { id } });
  }
}
