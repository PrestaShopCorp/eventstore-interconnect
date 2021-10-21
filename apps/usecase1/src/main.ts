import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SubscriptionsEventbusModule } from './subscriptions-eventbus.module';

async function bootstrap() {
  const logger = new Logger();

  try {
    const app = await NestFactory.create(SubscriptionsEventbusModule, {
      logger,
    });
    await app.init();
    logger.log('Subscriptions eventbus started');
  } catch (error) {
    logger.error(
      `Cannot init nestjs app, error: ${error}\n exiting with code E#5#`,
    );
    process.exit(5);
  }
}

bootstrap();
