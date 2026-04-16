import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@supply.local' })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'change-me-admin-password', minLength: 8 })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'password must be at least 8 characters' })
  password!: string;
}
