import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseEntity {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiJ9.signature',
  })
  access_token!: string;

  @ApiProperty({ example: 'Bearer' })
  token_type!: string;

  @ApiProperty({ example: 86400, description: 'Approximate lifetime in seconds' })
  expires_in!: number;
}
