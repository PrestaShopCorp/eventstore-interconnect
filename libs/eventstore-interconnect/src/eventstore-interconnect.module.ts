import { DynamicModule, Module } from '@nestjs/common';
import { InterconnectionConfiguration } from './interconnection-configuration';
import { ReaderModule } from './reader';
import { Hooks } from './hooks/hooks';

@Module({})
export class EventstoreInterconnectModule {
  public static connectToSrcAndDest(
    configuration: InterconnectionConfiguration,
    allowedEvents: any,
    hooks?: Hooks,
  ): DynamicModule {
    return {
      module: EventstoreInterconnectModule,
      imports: [ReaderModule.get(configuration, allowedEvents, hooks)],
    };
  }
}
