import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/prisma.service';

describe('Reports (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let adminToken: string;
  let clientToken: string;
  let projectId: number;
  let reportId: number;

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
      .send({ email: 'admin-reports@test.com', password: 'motdepasse123' });

    await prismaService.user.updateMany({
      where: { email: 'admin-reports@test.com' },
      data: { role: 'admin', isActive: true },
    });

    const adminRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin-reports@test.com', password: 'motdepasse123' });

    adminToken = adminRes.body.access_token;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'client-reports@test.com', password: 'motdepasse123' });

    await prismaService.user.updateMany({
      where: { email: 'client-reports@test.com' },
      data: { isActive: true },
    });

    const clientRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'client-reports@test.com', password: 'motdepasse123' });

    clientToken = clientRes.body.access_token;

    const adminUser = await prismaService.user.findUnique({
      where: { email: 'admin-reports@test.com' },
    });

    if (!adminUser) throw new Error('Admin user not found');

    const projectRes = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Projet reports', client: 'Client Test', userId: adminUser.id });

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

  it('POST /projects/:id/reports crée un compte rendu en tant qu\'admin', async () => {
    const res = await request(app.getHttpServer())
      .post(`/projects/${projectId}/reports`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Compte rendu Mars', content: 'Contenu du compte rendu', projectId });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Compte rendu Mars');
    reportId = res.body.id;
  });

  it('POST /projects/:id/reports retourne 403 pour un client', async () => {
    const res = await request(app.getHttpServer())
      .post(`/projects/${projectId}/reports`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ title: 'Compte rendu Mars', content: 'Contenu', projectId });

    expect(res.status).toBe(403);
  });

  it('GET /projects/:id/reports retourne les comptes rendus paginés', async () => {
    const res = await request(app.getHttpServer())
      .get(`/projects/${projectId}/reports`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
  });

  it('GET /projects/:id/reports/:reportId retourne un compte rendu', async () => {
    const res = await request(app.getHttpServer())
      .get(`/projects/${projectId}/reports/${reportId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(reportId);
  });

  it('PATCH /projects/:id/reports/:reportId met à jour un compte rendu', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/projects/${projectId}/reports/${reportId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Compte rendu Avril' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Compte rendu Avril');
  });

  it('DELETE /projects/:id/reports/:reportId supprime un compte rendu', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/projects/${projectId}/reports/${reportId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});