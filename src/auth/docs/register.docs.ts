import { ApiProperty } from '@nestjs/swagger';
import { UserRoleEnum } from '../../enums/user-role.enum';

export class RegisterDocs {
  @ApiProperty({
    description: 'Name of the user',
    example: 'Paola',
  })
  name: string;

  @ApiProperty({
    description: 'Email of the user',
    example: 'example@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Password for the user account',
    example: 'password123',
  })
  password: string;

  @ApiProperty({
    description: 'Role of the user',
    example: UserRoleEnum.USER,
    required: false,
    enum: UserRoleEnum,
  })
  role: UserRoleEnum;
}
