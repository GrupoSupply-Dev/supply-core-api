import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AppModule } from './app.module';

function buildCorsOrigins(): string[] {
  const fromEnv = (process.env.FRONTEND_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const defaults = ['http://localhost:3001', 'http://127.0.0.1:3001'];
  return [...new Set([...fromEnv, ...defaults])];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: buildCorsOrigins(),
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Supply Core API')
    .setDescription('Core services for corporate e-commerce')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste the access_token from POST /auth/login',
      },
      'JWT-auth',
    )
    .addTag('app', 'Root / health-style endpoint')
    .addTag('auth', 'JWT login')
    .addTag('categories', 'Catalog categories (create before products)')
    .addTag('products', 'Products and volume pricing')
    .addTag('discounts', 'Volume-aware price quotes')
    .addTag('orders', 'Checkout / order intake')
    .addTag('media', 'Image uploads (local disk; pluggable storage)')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
