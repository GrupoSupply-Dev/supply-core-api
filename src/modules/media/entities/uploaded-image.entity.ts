import { ApiProperty } from '@nestjs/swagger';

export class UploadedImageEntity {
  @ApiProperty({ enum: ['local', 'cloudinary'], example: 'local' })
  provider!: 'local' | 'cloudinary';

  @ApiProperty({
    example: '/uploads/3fa85f64-5717-4562-b3fc-2c963f66afa6.jpg',
    description: 'Path to use in <img src> or API base URL + this path',
  })
  publicUrl!: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6.jpg' })
  storedFilename!: string;
}
