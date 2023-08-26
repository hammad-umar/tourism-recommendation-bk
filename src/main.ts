import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');

  app.use(json({ limit: '50mb' }));
  app.enableCors({ origin: true, credentials: true });

  await app.listen(port);
}

bootstrap();
