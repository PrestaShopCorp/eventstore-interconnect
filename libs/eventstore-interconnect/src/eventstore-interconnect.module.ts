import { DynamicModule, Module, Type } from '@nestjs/common';
import { InterconnectionConfiguration } from './interconnection-configuration';
import { ReaderModule } from './reader';
import { SafetyNet } from './safety-net';

@Module({})
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
