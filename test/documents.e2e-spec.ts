process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5433/client_portal_test';
process.env.JWT_SECRET = 'secret_test';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/prisma.service';

describe('Documents (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let adminToken: string;
  let clientToken: string;
  let projectId: number;
  let documentId: number;

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
      .send({ email: 'admin-documents@test.com', password: 'motdepasse123' });

    await prismaService.user.updateMany({
      where: { email: 'admin-documents@test.com' },
      data: { role: 'admin' },
    });

    const adminRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin-documents@test.com', password: 'motdepasse123' });

    adminToken = adminRes.body.access_token;

    const clientRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'client-documents@test.com', password: 'motdepasse123' });

    clientToken = clientRes.body.access_token;

    const adminUser = await prismaService.user.findUnique({
      where: { email: 'admin-documents@test.com' },
    });

    if (!adminUser) throw new Error('Admin user not found');

    const projectRes = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Projet documents', client: 'Client Test', userId: adminUser.id });

    projectId = projectRes.body.id;
  });

  afterAll(async () => {
    await prismaService.document.deleteMany();
    await prismaService.report.deleteMany();
    await prismaService.step.deleteMany();
    await prismaService.project.deleteMany();
    await prismaService.user.deleteMany();
    await app.close();
  });

  it('POST /projects/:id/documents ajoute un document en tant qu\'admin', async () => {
    const res = await request(app.getHttpServer())
      .post(`/projects/${projectId}/documents`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Cahier des charges', url: 'https://example.com/doc.pdf', type: 'pdf', projectId });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Cahier des charges');
    documentId = res.body.id;
  });

  it('POST /projects/:id/documents retourne 403 pour un client', async () => {
    const res = await request(app.getHttpServer())
      .post(`/projects/${projectId}/documents`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ name: 'Cahier des charges', url: 'https://example.com/doc.pdf', type: 'pdf', projectId });

    expect(res.status).toBe(403);
  });

  it('GET /projects/:id/documents retourne les documents paginés', async () => {
    const res = await request(app.getHttpServer())
      .get(`/projects/${projectId}/documents`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
  });

  it('GET /projects/:id/documents/:documentId retourne un document', async () => {
    const res = await request(app.getHttpServer())
      .get(`/projects/${projectId}/documents/${documentId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(documentId);
  });

  it('PATCH /projects/:id/documents/:documentId met à jour un document', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/projects/${projectId}/documents/${documentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Cahier des charges V2' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Cahier des charges V2');
  });

  it('DELETE /projects/:id/documents/:documentId supprime un document', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/projects/${projectId}/documents/${documentId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});