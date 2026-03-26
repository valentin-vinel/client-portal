process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5433/client_portal_test';
process.env.JWT_SECRET = 'secret_test';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/prisma.service';

describe('Projects (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let adminToken: string;
  let clientToken: string;
  let projectId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    prismaService = app.get(PrismaService);
    await prismaService.document.deleteMany();
    await prismaService.report.deleteMany();
    await prismaService.step.deleteMany();
    await prismaService.project.deleteMany();
    await prismaService.user.deleteMany();

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'admin-projects@test.com', password: 'motdepasse123' });

    await prismaService.user.updateMany({
      where: { email: 'admin-projects@test.com' },
      data: { role: 'admin' },
    });

    const adminRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin-projects@test.com', password: 'motdepasse123' });

    adminToken = adminRes.body.access_token;

    const clientRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'client-projects@test.com', password: 'motdepasse123' });

    clientToken = clientRes.body.access_token;
  });

  afterAll(async () => {
    await prismaService.document.deleteMany();
    await prismaService.report.deleteMany();
    await prismaService.step.deleteMany();
    await prismaService.project.deleteMany();
    await prismaService.user.deleteMany();
    await app.close();
  });

  it('GET /projects retourne 401 sans token', async () => {
    const res = await request(app.getHttpServer()).get('/projects');
    expect(res.status).toBe(401);
  });

  it('GET /projects retourne 200 avec token', async () => {
    const res = await request(app.getHttpServer())
      .get('/projects')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
  });

  it('POST /projects crée un projet en tant qu\'admin', async () => {
    const adminUser = await prismaService.user.findUnique({
      where: { email: 'admin-projects@test.com' },
    });

    if (!adminUser) throw new Error('Admin user not found');

    const res = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Projet e2e', client: 'Client Test', userId: adminUser.id });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Projet e2e');
    projectId = res.body.id;
  });

  it('POST /projects retourne 403 pour un client', async () => {
    const adminUser = await prismaService.user.findUnique({
      where: { email: 'admin-projects@test.com' },
    });

    if (!adminUser) throw new Error('Admin user not found');

    const res = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ name: 'Projet e2e', client: 'Client Test', userId: adminUser.id });

    expect(res.status).toBe(403);
  });

  it('GET /projects/:id retourne le projet avec ses relations', async () => {
    const res = await request(app.getHttpServer())
      .get(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('steps');
    expect(res.body).toHaveProperty('reports');
    expect(res.body).toHaveProperty('documents');
  });

  it('GET /projects/:id retourne 404 si le projet n\'existe pas', async () => {
    const res = await request(app.getHttpServer())
      .get('/projects/9999')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });

  it('PATCH /projects/:id met à jour un projet', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Projet e2e modifié' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Projet e2e modifié');
  });

  it('DELETE /projects/:id supprime un projet', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});