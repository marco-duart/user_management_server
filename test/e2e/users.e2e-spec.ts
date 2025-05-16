import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../src/database/entities/user.entity';
import { Repository } from 'typeorm';
import { UserRoleEnum } from '../../src/enums/user-role.enum';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let authToken: string;
  let adminToken: string;
  let testUserId: number;

  const testUser = {
    name: 'Test User',
    email: 'teste@teste.com',
    password: 'teste123',
  };

  const adminUser = {
    name: 'Admin User',
    email: 'admin@teste.com',
    password: 'admin123',
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    await app.init();

    const user = await userRepository.create({
      email: testUser.email,
      password: testUser.password,
      role: UserRoleEnum.USER,
      name: testUser.name,
    });
    const admin = await userRepository.create({
      email: adminUser.email,
      password: adminUser.password,
      role: UserRoleEnum.ADMIN,
      name: adminUser.name,
    });
    await userRepository.save(user);
    await userRepository.save(admin);

    const response = await userRepository.findOne({
      where: { email: testUser.email },
    });
    testUserId = response.id;

    const adminResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminUser.email, password: adminUser.password });
    adminToken = adminResponse.body.token;

    const userResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });
    authToken = userResponse.body.token;
  });

  afterAll(async () => {
    await userRepository.delete({ email: testUser.email });
    await userRepository.delete({ email: adminUser.email });
    await app.close();
  });

  describe('/users (GET)', () => {
    it('should list users (admin only)', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.items)).toBe(true);
          expect(res.body.items.length).toBeGreaterThan(0);
        });
    });

    it('should forbid access for non-admins', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });
  });

  describe('/users/:id (PATCH)', () => {
    it('should update user (admin)', () => {
      const newName = 'Updated Name';
      return request(app.getHttpServer())
        .patch(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: newName })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe(newName);
        });
    });

    it('should allow self-update', () => {
      const newEmail = 'updated.email@example.com';
      return request(app.getHttpServer())
        .patch(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: newEmail })
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe(newEmail);
        });
    });
  });

  describe('/users/:id (DELETE)', () => {
    it('should delete user (admin only)', () => {
      return request(app.getHttpServer())
        .delete(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.response).toContain('Usuário deletado com sucesso.');
        });
    });

    it('should recreate test user for next tests', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser);
      testUserId = response.body.id;
    });
  });
});
