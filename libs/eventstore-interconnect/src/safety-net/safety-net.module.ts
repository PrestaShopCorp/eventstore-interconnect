import { DynamicModule, Logger, Module, Type } from '@nestjs/common';
import { DefaultSafetyNetService, SAFETY_NET, SafetyNet } from '.';
import { LOGGER } from '../constants';

@Module({})
export class SafetyNetModule {
  public static use(customStrategy?: Type<SafetyNet>): DynamicModule {
    return {
      module: SafetyNetModule,
      providers: [
        {
          provide: SAFETY_NET,
          useClass: customStrategy ?? DefaultSafetyNetService,
        },
        {
          provide: LOGGER,
          useValue: new Logger(),
        },
      ],
      exports: [SAFETY_NET],
    };
  }
}
