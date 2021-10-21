import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Usecase1Module } from './usecase1.module';

async function bootstrap() {
  const logger = new Logger();

  try {
    const app = await NestFactory.create(Usecase1Module, {
      logger,
    });
    await app.init();
    logger.log('Started');
  } catch (error) {
    logger.error(
      `Cannot init nestjs app, error: ${error}\n exiting with code E#5#`,
    );
  }
}

bootstrap();
