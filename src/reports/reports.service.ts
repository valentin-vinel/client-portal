import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findOne(id: number) {
    const report = await this.prismaService.report.findUnique({ where: { id } });
    if (!report) throw new NotFoundException(`Compte rendu ${id} introuvable`);
    return report;
  }

  create(dto: CreateReportDto) {
    return this.prismaService.report.create({ data: dto });
  }

  async update(id: number, dto: UpdateReportDto) {
    await this.findOne(id);
    return this.prismaService.report.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prismaService.report.delete({ where: { id } });
  }
}