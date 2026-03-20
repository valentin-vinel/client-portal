import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateStepDto } from './dto/create-step.dto';
import { UpdateStepDto } from './dto/update-step.dto';

@Injectable()
export class StepsService {
  constructor(private prismaService: PrismaService) {}

  findByProject(projectId: number) {
    return this.prismaService.step.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
    });
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