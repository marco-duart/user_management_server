import { UserRoleEnum } from '../../enums/user-role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CurrentUserDto {
  @ApiProperty({ example: 1 })
  user: number;

  @ApiProperty({ example: 'example@example.com' })
  email: string;

  @ApiProperty({ example: 'user' })
  role: UserRoleEnum;
}
