import { DynamicModule, Module, Type } from "@nestjs/common";
import { DefaultSafetyNetService, SAFETY_NET, SafetyNet } from "./index";
import { Logger } from "nestjs-pino-stackdriver";

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
        Logger,
      ],
      exports: [SAFETY_NET, Logger],
    };
  }
}
