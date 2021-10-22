import { DynamicModule, Logger, Module } from '@nestjs/common';
import InterconnectionConfiguration from './interconnection-configuration';
import { ContextModule } from 'nestjs-context';
import EventstoreInterconnectModuleHelper from './eventstore-interconnect.module.helper';
import { DriverModule } from './driver/driver.module';
import { EventbusBaseHandler } from './event-handler/eventbus-base.handler';

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

    return {
      module: EventstoreInterconnectModule,
      imports: [
        ContextModule.register(),
        eventStoreModuleSource,
        eventStoreModuleDest,

        DriverModule.get(configuration.destEventStoreConfiguration),
      ],
      providers: [EventbusBaseHandler, Logger],
      exports: [
        eventStoreModuleSource,
        eventStoreModuleDest,
        DriverModule,
        EventbusBaseHandler,
      ],
    };
  }
}
