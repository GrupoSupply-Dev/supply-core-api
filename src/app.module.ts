import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriesModule } from './modules/categories/categories.module';
import { DiscountsModule } from './modules/discounts/discounts.module';
import { MediaModule } from './modules/media/media.module';
import { ProductsModule } from './modules/products/products.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    CategoriesModule,
    ProductsModule,
    DiscountsModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
