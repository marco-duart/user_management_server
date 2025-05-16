import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../src/database/entities/user.entity';
import { Repository } from 'typeorm';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  const testUser = {
    name: 'Auth User',
    email: 'auth-test@teste.com',
    password: 'teste123',
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
  });

  afterAll(async () => {
    await userRepository.delete({ email: testUser.email });
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe(testUser.email);
        });
    });

    it('should fail with duplicate email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('E-mail já cadastrado.');
        });
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
          expect(typeof res.body.token).toBe('string');
        });
    });

    it('should fail with invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrong-password',
        })
        .expect(401);
    });
  });

  describe('/auth/me (GET)', () => {
    let authToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });
      authToken = loginResponse.body.token;
    });

    it('should get current user profile', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe(testUser.email);
          expect(res.body.password).toBeUndefined();
        });
    });

    it('should fail without token', () => {
      return request(app.getHttpServer()).get('/auth/me').expect(401);
    });
  });
});
