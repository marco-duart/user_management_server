import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { userMock } from '../testing/users.test/user.mock';
import { UserRoleEnum } from '../enums/user-role.enum';
import { HttpException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let repository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn().mockResolvedValue(userMock),
            update: jest.fn().mockResolvedValue({ affected: 1 }),
            softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
            findOneOrFail: jest.fn().mockResolvedValue(userMock),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getById', () => {
    it('should return user by id', async () => {
      const result = await service.getById(1);
      expect(result).toEqual(userMock);
    });

    it('should throw when user not found', async () => {
      repository.findOne.mockResolvedValueOnce(null);
      await expect(service.getById(999)).rejects.toThrow(HttpException);
    });
  });

  describe('update', () => {
    it('should update user when admin', async () => {
      const result = await service.update(1, {}, 999, UserRoleEnum.ADMIN);
      expect(result).toEqual(userMock);
    });

    it('should throw when non-admin tries to update another user', async () => {
      repository.findOne.mockResolvedValueOnce({ ...userMock, id: 1 });
      await expect(service.update(1, {}, 2, UserRoleEnum.USER)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('delete', () => {
    it('should soft delete user', async () => {
      const result = await service.delete(1);
      expect(result).toEqual({ response: 'User deleted with success.' });
    });
  });

  it('should call bcrypt.hash when password is provided', async () => {
    const hashSpy = jest
      .spyOn(bcrypt, 'hash')
      .mockResolvedValue('hashed' as never);
    await service.update(1, { password: 'new' }, 1, UserRoleEnum.USER);
    expect(hashSpy).toHaveBeenCalled();
    hashSpy.mockRestore();
  });
});
