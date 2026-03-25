import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class DocumentsService {
  constructor(private prismaService: PrismaService) {}

  async findByProject(projectId: number, pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prismaService.document.findMany({
        where: { projectId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.document.count({ where: { projectId } }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const document = await this.prismaService.document.findUnique({ where: { id } });
    if (!document) throw new NotFoundException(`Document ${id} introuvable`);
    return document;
  }

  create(dto: CreateDocumentDto) {
    return this.prismaService.document.create({ data: dto });
  }

  async update(id: number, dto: UpdateDocumentDto) {
    await this.findOne(id);
    return this.prismaService.document.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prismaService.document.delete({ where: { id } });
  }
}