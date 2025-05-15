import { UsersService } from '../../users/users.service';
import { userMock } from './user.mock';

export const userServiceMock = {
  provide: UsersService,
  useValue: {
    createUser: jest.fn().mockResolvedValue(userMock),
    findEmail: jest.fn().mockResolvedValue(false),
    findOneOrFail: jest.fn().mockResolvedValue(userMock),
  },
};
