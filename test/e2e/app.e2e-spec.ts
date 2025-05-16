import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/not-found (GET) - 404 Handling', () => {
    return request(app.getHttpServer())
      .get('/not-found-route')
      .expect(404)
      .expect((res) => {
        expect(res.body.message).toMatch('Cannot GET /not-found-route');
      });
  });
});
