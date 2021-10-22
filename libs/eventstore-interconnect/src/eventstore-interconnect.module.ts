import { DynamicModule, Module } from '@nestjs/common';
import InterconnectionConfiguration from './interconnection-configuration';
import { HTTPClient } from 'geteventstore-promise';
import { ContextModule } from 'nestjs-context';
import EventstoreInterconnectModuleHelper from '@eventstore-interconnect/eventstore-interconnect.module.helper';
import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';

@Module({})
export class EventstoreInterconnectModule {
  public static connectToSrcAndDest(
    configuration: InterconnectionConfiguration,
  ): DynamicModule {
    const eventStoreModuleSource: DynamicModule =
      EventstoreInterconnectModuleHelper.getSourceEventStoreModule(
        configuration,
      );

    const eventStoreModuleDest: DynamicModule =
      EventstoreInterconnectModuleHelper.getDestinationEventStoreModule(
        configuration,
      );

    const clientProvider: Provider =
      EventstoreInterconnectModuleHelper.getHttpClientProvider(configuration);

    return {
      module: EventstoreInterconnectModule,
      providers: [clientProvider],
      imports: [
        ContextModule.register(),
        eventStoreModuleSource,
        eventStoreModuleDest,
      ],
      exports: [eventStoreModuleSource, eventStoreModuleDest, HTTPClient],
    };
  }
}
