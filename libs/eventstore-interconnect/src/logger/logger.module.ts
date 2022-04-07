import { DynamicModule, Global, Logger, Module } from '@nestjs/common';
import { LOGGER } from './constants';
import { NoDebugLoggerService } from './no-debug-logger.service';

@Module({
  exports: [LOGGER],
})
@Global()
export class LoggerModule {
  public static forRoot(showDebugLogs: boolean): DynamicModule {
    if (showDebugLogs) {
      return {
        module: LoggerModule,
        providers: [
          {
            provide: LOGGER,
            useClass: Logger,
          },
        ],
      };
    }
    return {
      module: LoggerModule,
      providers: [
        {
          provide: LOGGER,
          useClass: NoDebugLoggerService,
        },
      ],
    };
  }
}
