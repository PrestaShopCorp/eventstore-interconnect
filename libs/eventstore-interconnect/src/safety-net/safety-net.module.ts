import { DynamicModule, Module } from '@nestjs/common';
import { DefaultSafetyNetService, SAFETY_NET } from '.';
import { Logger } from 'nestjs-pino-stackdriver';

@Module({})
export class SafetyNetModule {
  public static use(customStrategy?): DynamicModule {
    return {
      module: SafetyNetModule,
      providers: [
        {
          provide: SAFETY_NET,
          useClass: customStrategy ?? DefaultSafetyNetService,
        },
        Logger,
      ],
      exports: [SAFETY_NET, Logger],
    };
  }
}
