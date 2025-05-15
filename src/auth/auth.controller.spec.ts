import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CurrentUserDto } from '../decorators/dto/current-user.dto';
import { UserRoleEnum } from '../enums/user-role.enum';
import { userMock } from '../testing/users.test/user.mock';
import { tokenMock } from '../testing/auth.test/token.mock';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    registerUser: jest.fn(),
    login: jest.fn(),
    me: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should successfully register a new user', async () => {
      const registerDto: RegisterDto = {
        name: 'Teste User',
        email: 'teste@teste.com',
        password: 'password123',
      };

      mockAuthService.registerUser.mockResolvedValue(userMock);

      const result = await controller.registerUser(registerDto);
      
      expect(result).toEqual(userMock);
      expect(authService.registerUser).toHaveBeenCalledTimes(1);
      expect(authService.registerUser).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should return an authentication token', async () => {
      const loginDto: LoginDto = {
        email: 'teste@teste.com',
        password: 'password123',
      };
      const expectedResponse = { token: tokenMock };

      mockAuthService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);
      
      expect(result).toEqual(expectedResponse);
      expect(authService.login).toHaveBeenCalledTimes(1);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('me', () => {
    it('should return current user profile', async () => {
      const currentUser: CurrentUserDto = {
        user: 1,
        email: 'teste@teste.com',
        role: UserRoleEnum.ADMIN,
      };

      mockAuthService.me.mockResolvedValue(userMock);

      const result = await controller.me(currentUser);
      
      expect(result).toEqual(userMock);
      expect(authService.me).toHaveBeenCalledTimes(1);
      expect(authService.me).toHaveBeenCalledWith(currentUser.user);
    });
  });
});