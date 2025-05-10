import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDocs {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hcnlAZW1haWwuY29tIiwidXNlciI6Mywicm9sZSI6ImFkbWluIiwiaWF0IjoxNzE2MzAyODM3LCJleHAiOjE3MTYzMTAwMzd9.2rfpnNnIGEjqEa11XDDHf2p_lzRix5UCtfyUOxjv1RQ' })
  token: string;
}
