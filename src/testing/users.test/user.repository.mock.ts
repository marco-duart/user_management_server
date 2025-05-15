import { getRepositoryToken } from '@nestjs/typeorm';
import { userMock } from './user.mock';
import { User } from '../../database/entities/user.entity';

export const userRepositoryMock = {
  provide: getRepositoryToken(User),
  useValue: {
    findOne: jest.fn().mockResolvedValue(userMock),
    update: jest.fn().mockResolvedValue(userMock),
    find: jest.fn().mockResolvedValue(userMock),
    findOneOrFail: jest.fn().mockResolvedValue(userMock),
    softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
  },
};
