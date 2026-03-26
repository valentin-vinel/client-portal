import { Test, TestingModule } from '@nestjs/testing';
import { StepsService } from './steps.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  step: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('StepsService', () => {
  let service: StepsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StepsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<StepsService>(StepsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findByProject', () => {
    it('retourne les étapes paginées d\'un projet', async () => {
      const steps = [{ id: 1, title: 'Maquettes', order: 1 }];
      mockPrismaService.step.findMany.mockResolvedValue(steps);
      mockPrismaService.step.count.mockResolvedValue(1);

      const result = await service.findByProject(1, { page: 1, limit: 10 });

      expect(result.data).toEqual(steps);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('retourne une étape par son id', async () => {
      const step = { id: 1, title: 'Maquettes' };
      mockPrismaService.step.findUnique.mockResolvedValue(step);

      const result = await service.findOne(1);
      expect(result).toEqual(step);
    });

    it('lève une NotFoundException si l\'étape n\'existe pas', async () => {
      mockPrismaService.step.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('crée une étape', async () => {
      const dto = { title: 'Maquettes', order: 1, projectId: 1 };
      const step = { id: 1, ...dto };
      mockPrismaService.step.create.mockResolvedValue(step);

      const result = await service.create(dto);
      expect(result).toEqual(step);
    });
  });

  describe('update', () => {
    it('met à jour une étape existante', async () => {
      const step = { id: 1, title: 'Maquettes' };
      mockPrismaService.step.findUnique.mockResolvedValue(step);
      mockPrismaService.step.update.mockResolvedValue({ ...step, title: 'Maquettes V2' });

      const result = await service.update(1, { title: 'Maquettes V2' });
      expect(result.title).toBe('Maquettes V2');
    });

    it('lève une NotFoundException si l\'étape n\'existe pas', async () => {
      mockPrismaService.step.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { title: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('supprime une étape existante', async () => {
      const step = { id: 1, title: 'Maquettes' };
      mockPrismaService.step.findUnique.mockResolvedValue(step);
      mockPrismaService.step.delete.mockResolvedValue(step);

      const result = await service.remove(1);
      expect(result).toEqual(step);
    });

    it('lève une NotFoundException si l\'étape n\'existe pas', async () => {
      mockPrismaService.step.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});