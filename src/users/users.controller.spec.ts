import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { CurrentUserDto } from '../decorators/dto/current-user.dto';
import { UserRoleEnum } from '../enums/user-role.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { userMock } from '../testing/users.test/user.mock';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockPagination = {
    items: [userMock],
    meta: {
      itemCount: 1,
      totalItems: 1,
      itemsPerPage: 10,
      totalPages: 1,
      currentPage: 1,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            getUsersWithLastLoginOver30Days: jest
              .fn()
              .mockResolvedValue(mockPagination),
            getAll: jest.fn().mockResolvedValue(mockPagination),
            delete: jest
              .fn()
              .mockResolvedValue({ response: 'User deleted with success.' }),
            update: jest.fn().mockResolvedValue(userMock),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RoleGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  describe('getAll', () => {
    it('should return paginated users with default filters', async () => {
      const result = await controller.getAll();

      expect(result).toEqual(mockPagination);
      expect(service.getAll).toHaveBeenCalledWith({}, { page: 1, limit: 10 });
    });

    it('should apply filters when provided', async () => {
      const filters: {
        role: UserRoleEnum;
        sortBy: 'name' | 'createdAt';
        order: 'ASC' | 'DESC';
        page: number;
        limit: number;
      } = {
        role: UserRoleEnum.ADMIN,
        sortBy: 'name',
        order: 'DESC',
        page: 2,
        limit: 5,
      };

      await controller.getAll(filters.role, filters.sortBy, filters.order, {
        page: filters.page,
        limit: filters.limit,
      });

      expect(service.getAll).toHaveBeenCalledWith(
        {
          role: filters.role,
          sortBy: filters.sortBy,
          order: filters.order,
        },
        { page: filters.page, limit: filters.limit },
      );
    });
  });

  describe('getInactiveUsers', () => {
    it('should return paginated inactive users', async () => {
      const result = await controller.getInactiveUsers({ page: 1, limit: 10 });

      expect(result).toEqual(mockPagination);
      expect(service.getUsersWithLastLoginOver30Days).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });
  });

  describe('update', () => {
    const currentUser: CurrentUserDto = {
      user: 1,
      email: 'admin@test.com',
      role: UserRoleEnum.ADMIN,
    };

    it('should update user when current user is admin', async () => {
      const updateData: UpdateUserDto = { name: 'Updated Name' };
      const result = await controller.update(1, updateData, currentUser);

      expect(result).toEqual(userMock);
      expect(service.update).toHaveBeenCalledWith(
        1,
        updateData,
        currentUser.user,
        currentUser.role,
      );
    });

    it('should allow self-update for non-admin users', async () => {
      const regularUser: CurrentUserDto = {
        user: 2,
        email: 'user@test.com',
        role: UserRoleEnum.USER,
      };

      await controller.update(2, { name: 'Self Update' }, regularUser);

      expect(service.update).toHaveBeenCalledWith(
        2,
        { name: 'Self Update' },
        regularUser.user,
        regularUser.role,
      );
    });
  });

  describe('delete', () => {
    it('should soft delete user', async () => {
      const result = await controller.delete(1);

      expect(result).toEqual({ response: 'User deleted with success.' });
      expect(service.delete).toHaveBeenCalledWith(1);
    });
  });
});
