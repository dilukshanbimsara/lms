import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS so the Next.js frontend can call this API
  app.enableCors({
    origin: (
      [
        'http://localhost:3000',
        'http://localhost:3001',
        process.env.FRONTEND_URL,
      ] as (string | undefined)[]
    ).filter(Boolean) as string[],
    credentials: true,
  });

  // Auto-validate all incoming request DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // strip unknown properties
      forbidNonWhitelisted: false,
      transform: true,       // auto-transform payloads to DTO class instances
    }),
  );

  // Global API prefix — all routes become /api/...
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`TutioLMS API running at http://localhost:${port}/api`);
}

bootstrap();
