import { DynamicModule, Module } from '@nestjs/common';
import InterconnectionConfiguration, {
  LatestEventStoreConfiguration,
  LegacyEventStoreConfiguration,
} from './interconnection-configuration';
import { CqrsEventStoreModule } from 'nestjs-geteventstore-legacy';
import { HTTPClient } from 'geteventstore-promise';
import { ContextModule } from 'nestjs-context';

@Module({})
export class EventstoreInterconnectModule {
  public static connectToSrcAndDest(
    configuration: InterconnectionConfiguration,
  ): DynamicModule {
    const eventStoreModuleSource: DynamicModule =
      this.getSourceEventStoreConfiguration(configuration);

    const eventStoreModuleDest: DynamicModule =
      this.getDestinationEventStoreConfiguration(configuration);

    return {
      module: EventstoreInterconnectModule,
      providers: [
        {
          provide: HTTPClient,
          useValue: new HTTPClient({
            hostname:
              configuration.destEventStoreConfiguration.connectionConfig.http
                .host,
            port: configuration.destEventStoreConfiguration.connectionConfig
              .http.port,
            credentials:
              configuration.destEventStoreConfiguration.connectionConfig
                .credentials,
          }),
        },
      ],
      imports: [
        ContextModule.register(),
        eventStoreModuleSource,
        eventStoreModuleDest,
      ],
      exports: [eventStoreModuleSource, eventStoreModuleDest, HTTPClient],
    };
  }

  private static getDestinationEventStoreConfiguration(
    configuration: InterconnectionConfiguration,
  ): DynamicModule {
    return EventstoreInterconnectModule.isLegacyConf(
      configuration.destEventStoreConfiguration,
    )
      ? CqrsEventStoreModule.register(
          configuration.destEventStoreConfiguration.connectionConfig,
          configuration.destEventStoreConfiguration.eventStoreServiceConfig,
          configuration.destEventStoreConfiguration.eventBusConfig,
        )
      : CqrsEventStoreModule.register(
          // @ts-ignore
          configuration.destEventStoreConfiguration.connectionConfig,
          // @ts-ignore
          configuration.destEventStoreConfiguration.eventStoreServiceConfig,
          // @ts-ignore
          configuration.destEventStoreConfiguration.eventBusConfig,
        );
  }

  private static getSourceEventStoreConfiguration(
    configuration: InterconnectionConfiguration,
  ): DynamicModule {
    return EventstoreInterconnectModule.isLegacyConf(
      configuration.sourceEventStoreConfiguration,
    )
      ? CqrsEventStoreModule.register(
          configuration.sourceEventStoreConfiguration.connectionConfig,
          configuration.sourceEventStoreConfiguration.eventStoreServiceConfig,
          configuration.sourceEventStoreConfiguration.eventBusConfig,
        )
      : CqrsEventStoreModule.register(
          // @ts-ignore
          configuration.sourceEventStoreConfiguration.connectionConfig,
          // @ts-ignore
          configuration.sourceEventStoreConfiguration.eventStoreServiceConfig,
          // @ts-ignore
          configuration.sourceEventStoreConfiguration.eventBusConfig,
        );
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
