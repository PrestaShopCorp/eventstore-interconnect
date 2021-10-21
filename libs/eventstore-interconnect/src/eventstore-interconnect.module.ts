import { DynamicModule, Module } from '@nestjs/common';
import { EventstoreInterconnectService } from './eventstore-interconnect.service';
import { EventStoreCqrsModule } from 'nestjs-geteventstore-1.6.4';
import InterconnectionConfiguration, {
  LatestEventStoreConfiguration,
  LegacyEventStoreConfiguration,
} from './interconnection-configuration';

@Module({
  providers: [EventstoreInterconnectService],
  exports: [EventstoreInterconnectService],
})
export class EventstoreInterconnectModule {
  public static connectToSrcAndDest(
    configuration: InterconnectionConfiguration,
  ): DynamicModule {
    const eventStoreModuleSource: DynamicModule =
      EventstoreInterconnectModule.isLegacyConf(
        configuration.sourceEventStoreConfiguration,
      )
        ? EventStoreCqrsModule.register(
            configuration.sourceEventStoreConfiguration.connectionConfig,
            configuration.sourceEventStoreConfiguration.eventStoreBusConfig,
          )
        : EventStoreCqrsModule.register(
            // @ts-ignore
            configuration.sourceEventStoreConfiguration.connectionConfig,
            // @ts-ignore
            configuration.sourceEventStoreConfiguration.eventStoreBusConfig,
          );
    const eventStoreModuleDest: DynamicModule =
      EventstoreInterconnectModule.isLegacyConf(
        configuration.destEventStoreConfiguration,
      )
        ? EventStoreCqrsModule.register(
            configuration.destEventStoreConfiguration.connectionConfig,
            configuration.sourceEventStoreConfiguration.eventStoreBusConfig,
          )
        : EventStoreCqrsModule.register(
            // @ts-ignore
            configuration.destEventStoreConfiguration.connectionConfig,
            configuration.sourceEventStoreConfiguration.eventStoreBusConfig,
          );
    return {
      module: EventstoreInterconnectModule,
      imports: [eventStoreModuleSource, eventStoreModuleDest],
    };
  }

  private static isLegacyConf(
    configuration:
      | LegacyEventStoreConfiguration
      | LatestEventStoreConfiguration,
  ): configuration is LegacyEventStoreConfiguration {
    return (
      (configuration as LegacyEventStoreConfiguration).connectionConfig.http !==
      undefined
    );
  }
}
