import { ApiProperty } from '@nestjs/swagger';
import { UserRoleEnum } from '../../enums/user-role.enum';

export class UserDocs {
  @ApiProperty({ example: 1, description: 'The id of the user.' })
  id: number;

  @ApiProperty({ example: 'Wafiter', description: 'The name of the user.' })
  name: string;

  @ApiProperty({
    example: 'example@example.com',
    description: 'The email of the user. Must be unique.',
  })
  email: string;

  @ApiProperty({
    example: 'e234dsdom3k2kmdl3l43iwes9vjro44223m3n32kn5n2ksdo4',
    description: 'The hashed password of the user.',
    writeOnly: true,
  })
  password: string;

  @ApiProperty({
    example: UserRoleEnum.USER,
    description: 'The role of the user.',
  })
  role: UserRoleEnum;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'The date when was created.',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-02T00:00:00.000Z',
    description: 'The date when was updated.',
  })
  updatedAt: Date;

  @ApiProperty({
    example: '2024-01-03T00:00:00.000Z',
    description: 'The date when was deleted.',
  })
  deletedAt: Date;
}
