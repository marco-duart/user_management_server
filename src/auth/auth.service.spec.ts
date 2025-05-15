import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { HttpException } from '@nestjs/common';
import { jwtServiceMock } from '../testing/auth.test/jwt.service.mock';
import { userMock } from '../testing/users.test/user.mock';
import { loginDtoMock } from '../testing/auth.test/login.mock';
import { registerUserDtoMock } from '../testing/auth.test/register.mock';
import { tokenMock } from '../testing/auth.test/token.mock';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        jwtServiceMock,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findOneOrFail: jest.fn(),
            exists: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should successfully register a new user', async () => {
      userRepository.exists.mockResolvedValue(false);
      userRepository.create.mockReturnValue(userMock);
      userRepository.save.mockResolvedValue(userMock);

      const result = await service.registerUser(registerUserDtoMock);

      expect(result).toEqual(userMock);
      expect(userRepository.exists).toHaveBeenCalledWith({
        where: { email: registerUserDtoMock.email },
      });
      expect(userRepository.create).toHaveBeenCalledWith(registerUserDtoMock);
      expect(userRepository.save).toHaveBeenCalledWith(userMock);
    });

    it('should throw an exception when email already exists', async () => {
      userRepository.exists.mockResolvedValue(true);

      await expect(service.registerUser(registerUserDtoMock)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('login', () => {
    it('should return an authentication token for valid credentials', async () => {
      userRepository.findOne.mockResolvedValue({
        ...userMock,
        password: 'hashed_password',
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.login(loginDtoMock);

      expect(result).toEqual({ token: tokenMock });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDtoMock.email },
        select: {
          email: true,
          id: true,
          password: true,
          role: true,
        },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDtoMock.password,
        'hashed_password',
      );
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      userRepository.findOne.mockResolvedValue({
        ...userMock,
        password: 'hashed_password',
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.login(loginDtoMock)).rejects.toThrow(HttpException);
    });

    it('should throw HttpException when user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDtoMock)).rejects.toThrow(HttpException);
    });
  });

  describe('me', () => {
    it('should return user profile by id', async () => {
      userRepository.findOneOrFail.mockResolvedValue(userMock);

      const result = await service.me(1);

      expect(result).toEqual(userMock);
      expect(userRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw HttpException when user is not found', async () => {
      userRepository.findOneOrFail.mockRejectedValue(new Error('Not found'));

      await expect(service.me(1)).rejects.toThrow(HttpException);
    });
  });
});
