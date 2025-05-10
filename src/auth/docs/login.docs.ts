import { ApiProperty } from '@nestjs/swagger';

export class LoginDocs {
  @ApiProperty({ example: 'example@example.com' })
  email: string;

  @ApiProperty({ example: 'password123' })
  password: string;
}
