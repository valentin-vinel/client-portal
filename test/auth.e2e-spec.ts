process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5433/client_portal_test';
process.env.JWT_SECRET = 'secret_test';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    prismaService = app.get(PrismaService);
    await prismaService.user.deleteMany();
    await prismaService.project.deleteMany();
  });

  afterAll(async () => {
    await prismaService.user.deleteMany();
    await prismaService.project.deleteMany();
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('crée un compte et retourne un token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'e2e@test.com', password: 'motdepasse123' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('access_token');
    });

    it('retourne 409 si l\'email existe déjà', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'double@test.com', password: 'motdepasse123' });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'double@test.com', password: 'motdepasse123' });

      expect(res.status).toBe(409);
    });

    it('retourne 400 si le body est invalide', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'pasunemail' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('retourne un token avec des identifiants valides', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'login@test.com', password: 'motdepasse123' });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'login@test.com', password: 'motdepasse123' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('access_token');
    });

    it('retourne 401 avec un mauvais mot de passe', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'login@test.com', password: 'mauvais' });

      expect(res.status).toBe(401);
    });
  });

});