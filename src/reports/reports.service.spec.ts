import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  report: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('ReportsService', () => {
  let service: ReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findByProject', () => {
    it('retourne les comptes rendus paginés d\'un projet', async () => {
      const reports = [{ id: 1, title: 'Compte rendu Mars', projectId: 1 }];
      mockPrismaService.report.findMany.mockResolvedValue(reports);
      mockPrismaService.report.count.mockResolvedValue(1);

      const result = await service.findByProject(1, { page: 1, limit: 10 });

      expect(result.data).toEqual(reports);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('retourne un compte rendu par son id', async () => {
      const report = { id: 1, title: 'Compte rendu Mars' };
      mockPrismaService.report.findUnique.mockResolvedValue(report);

      const result = await service.findOne(1);
      expect(result).toEqual(report);
    });

    it('lève une NotFoundException si le compte rendu n\'existe pas', async () => {
      mockPrismaService.report.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('crée un compte rendu', async () => {
      const dto = { title: 'Compte rendu Mars', content: 'Contenu', projectId: 1 };
      const report = { id: 1, ...dto };
      mockPrismaService.report.create.mockResolvedValue(report);

      const result = await service.create(dto);
      expect(result).toEqual(report);
    });
  });

  describe('update', () => {
    it('met à jour un compte rendu existant', async () => {
      const report = { id: 1, title: 'Compte rendu Mars' };
      mockPrismaService.report.findUnique.mockResolvedValue(report);
      mockPrismaService.report.update.mockResolvedValue({ ...report, title: 'Compte rendu Avril' });

      const result = await service.update(1, { title: 'Compte rendu Avril' });
      expect(result.title).toBe('Compte rendu Avril');
    });

    it('lève une NotFoundException si le compte rendu n\'existe pas', async () => {
      mockPrismaService.report.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { title: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('supprime un compte rendu existant', async () => {
      const report = { id: 1, title: 'Compte rendu Mars' };
      mockPrismaService.report.findUnique.mockResolvedValue(report);
      mockPrismaService.report.delete.mockResolvedValue(report);

      const result = await service.remove(1);
      expect(result).toEqual(report);
    });

    it('lève une NotFoundException si le compte rendu n\'existe pas', async () => {
      mockPrismaService.report.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});