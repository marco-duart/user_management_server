import { ApiProperty } from '@nestjs/swagger';
import { UserRoleEnum } from 'src/enums/user-role.enum';
import { UserStatusEnum } from 'src/enums/user-status.enum';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'João Silva' })
  name: string;

  @ApiProperty({ example: 'joao@email.com' })
  email: string;

  @ApiProperty({ enum: UserRoleEnum, example: UserRoleEnum.USER })
  role: UserRoleEnum;

  @ApiProperty({ enum: UserStatusEnum, example: UserStatusEnum.ACTIVE })
  status: UserStatusEnum;

  @ApiProperty({ example: '2024-05-13T12:34:56.789Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-05-13T12:34:56.789Z' })
  updatedAt: Date;

  @ApiProperty({ example: '2024-04-01T08:00:00.000Z', required: false })
  lastLoginAt?: Date;
}
