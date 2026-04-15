import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../src/app.module';

const expressApp = express();
let isAppInitialized = false;

async function bootstrapNest() {
  if (isAppInitialized) return;

  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await nestApp.init();
  isAppInitialized = true;
}

export default async function handler(req: any, res: any) {
  await bootstrapNest();
  return expressApp(req, res);
}
