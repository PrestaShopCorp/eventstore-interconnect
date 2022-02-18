import { Global, Logger, Module } from '@nestjs/common';
import { LOGGER } from './constants';

@Module({
  providers: [
    {
      provide: LOGGER,
      useClass: Logger,
    },
  ],
  exports: [LOGGER],
})
@Global()
export class LoggerModule {}
