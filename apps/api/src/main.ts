import { env } from './config/env/env';
import './instrument';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { AppModule } from './app.module';
import SwaggerBuilder from './config/swagger/swagger.config';
import { CLIENT_URL, GLOBAL_PREFIX } from './utils/constants';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix(GLOBAL_PREFIX);
  app.use(cookieParser());
  app.use(
    cors({
      origin: CLIENT_URL,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: 'Content-Type, Authorization',
      credentials: true,
    }),
  );

  app.set('trust proxy', 1);

  const port = env().PORT;

  // swagger
  SwaggerBuilder.make(app);

  await app.listen(port);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${GLOBAL_PREFIX}`,
  );
}

bootstrap();
