import { createStackdriverLoggerTool, Logger } from 'nestjs-pino-stackdriver';
import { NestFactory } from '@nestjs/core';
import { UsecaseModule } from './usecase.module';

async function bootstrap() {
  const logger = new Logger();

  try {
    const app = await NestFactory.create(UsecaseModule, {
      logger: createStackdriverLoggerTool(),
    });
    await app.init();
  } catch (error) {
    logger.error(
      `Cannot init nestjs app, error: ${error}\n exiting with code E#5#`,
    );
    process.exit(1);
  }
}

bootstrap();
