import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportsService {
  constructor(private prismaService: PrismaService) {}

  findByProject(projectId: number) {
    return this.prismaService.report.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prismaService.report.findUnique({
      where: { id },
    });
  }

  create(dto: CreateReportDto) {
    return this.prismaService.report.create({
      data: dto,
    });
  }

  update(id: number, dto: UpdateReportDto) {
    return this.prismaService.report.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: number) {
    return this.prismaService.report.delete({
      where: { id },
    });
  }
}