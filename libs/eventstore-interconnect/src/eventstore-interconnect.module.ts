import { DynamicModule, Module, Type } from '@nestjs/common';
import { InterconnectionConfiguration } from './model';
import { ReaderModule } from './reader';
import { SafetyNet } from './safety-net';
import { LoggerModule } from './logger';

@Module({
  imports: [LoggerModule],
})
export class EventstoreInterconnectModule {
  public static connectToSrcAndDest(
    configuration: InterconnectionConfiguration,
    allowedEvents: any,
    customStrategy?: Type<SafetyNet>,
  ): DynamicModule {
    return {
      module: EventstoreInterconnectModule,
      imports: [ReaderModule.get(configuration, allowedEvents, customStrategy)],
    };
  }
}
