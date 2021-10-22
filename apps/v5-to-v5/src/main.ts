import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { v5ToV5Module } from './v5-to-v5.module';

async function bootstrap() {
  const logger = new Logger();

  try {
    const app = await NestFactory.create(v5ToV5Module, {
      logger,
    });
    const port = 3000;
    await app.listen(port);

    logger.log('Started, listening on ' + port);
  } catch (error) {
    logger.error(
      `Cannot init nestjs app, error: ${error}\n exiting with code E#5#`,
    );
  }
}

bootstrap();