import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Enable CORS for development
  const isDevelopment = process.env.NODE_ENV !== 'production';
  app.enableCors({
    origin: isDevelopment
      ? '*'
      : configService.get<string>('FRONTEND_URL', 'http://localhost:4200'),
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = configService.get<number>('PORT', 3000);
  const host = configService.get<string>('HOST', '0.0.0.0');
  await app.listen(port, host);

  console.log(`🚀 Server running on http://${host}:${port}`);
  console.log(`📦 API available at http://${host}:${port}/api`);
}

void bootstrap();
