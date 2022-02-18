import { DynamicModule, Module, Type } from '@nestjs/common';
import { DefaultSafetyNetService, SAFETY_NET, SafetyNet } from '.';

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
      ],
      exports: [SAFETY_NET],
    };
  }
}
