import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Válvulas',
    description: 'Unique category name (displayed in catalog)',
    minLength: 2,
    maxLength: 120,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;
}
