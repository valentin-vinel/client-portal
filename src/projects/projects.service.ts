import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prismaService: PrismaService) {}

  findAll(userId: number, role: string) {
    if (role === 'admin') {
      return this.prismaService.project.findMany({
        include: { user: { select: { id: true, email: true, role: true } } },
      });
    }

    return this.prismaService.project.findMany({
      where: { userId },
      include: { user: { select: { id: true, email: true, role: true } } },
    })
    
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
