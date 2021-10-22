import { DynamicModule, Logger, Module } from '@nestjs/common';
import { EventstoreInterconnectService } from './interconnect-service/eventstore-interconnect.service';
import InterconnectionConfiguration, {
  LatestEventStoreConfiguration,
  LegacyEventStoreConfiguration,
} from './interconnection-configuration';
import { CqrsEventStoreModule } from 'nestjs-geteventstore-4.0.1';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { sentryForFacebookConfiguration } from '../../../apps/usecase1/src/configuration/sentry-facebook';
import { HTTPClient } from 'geteventstore-promise';
import { CqrsModule } from '@nestjs/cqrs';
import { ContextModule } from 'nestjs-context';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({})
export class EventstoreInterconnectModule {
  public static connectToSrcAndDest(
    configuration: InterconnectionConfiguration,
  ): DynamicModule {
    const eventStoreModuleSource: DynamicModule =
      EventstoreInterconnectModule.isLegacyConf(
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

    const eventStoreModuleDest: DynamicModule =
      EventstoreInterconnectModule.isLegacyConf(
        configuration.destEventStoreConfiguration,
      )
        ? CqrsEventStoreModule.register(
            configuration.sourceEventStoreConfiguration.connectionConfig,
            configuration.sourceEventStoreConfiguration.eventStoreServiceConfig,
            configuration.sourceEventStoreConfiguration.eventBusConfig,
          )
        : CqrsEventStoreModule.register(
            // @ts-ignore
            configuration.sourceEventStoreConfiguration.connectionConfig,
            configuration.sourceEventStoreConfiguration.eventStoreServiceConfig,
            configuration.sourceEventStoreConfiguration.eventBusConfig,
          );
    return {
      module: EventstoreInterconnectModule,
      providers: [
        EventstoreInterconnectService,
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
        CqrsModule,
        Logger,
        ContextModule.register(),

        eventStoreModuleSource,
        eventStoreModuleDest,
      ],
      exports: [
        eventStoreModuleSource,
        eventStoreModuleDest,
        HTTPClient,
        CqrsModule,
        EventstoreInterconnectService,
      ],
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
