import { UserStatusEnum } from '../../enums/user-status.enum';
import { UserRoleEnum } from '../../enums/user-role.enum';

export const userMock = {
  id: 1,
  name: 'Teste User',
  email: 'teste@teste.com',
  password: 'password123',
  role: UserRoleEnum.ADMIN,
  status: UserStatusEnum.ACTIVE,
  lastLoginAt: new Date(),
};
