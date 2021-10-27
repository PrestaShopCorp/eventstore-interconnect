import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { usecaseModule } from './usecase/usecase.module';

async function bootstrap() {
  const logger = new Logger();

  try {
    const app = await NestFactory.create(usecaseModule, {
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
