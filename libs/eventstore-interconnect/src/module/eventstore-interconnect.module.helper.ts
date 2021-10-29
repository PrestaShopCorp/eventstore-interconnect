import { DynamicModule } from '@nestjs/common';
import { CqrsEventStoreModule as CqrsEventStoreModuleLegacy } from 'nestjs-geteventstore-legacy/dist/cqrs-event-store.module';
import { CqrsEventStoreModule as CqrsEventStoreModuleNext } from 'nestjs-geteventstore-next/dist/cqrs-event-store.module';
import { ConfigurationsHelper } from './configurations.helper';
import { InterconnectionConfiguration } from '../interconnection-configuration';

export default class EventstoreInterconnectModuleHelper {
  public static getSourceEventStoreModule(
    configuration: InterconnectionConfiguration,
  ): DynamicModule {
    return ConfigurationsHelper.isLegacyConf(configuration.source)
      ? this.registerToLegacyEventStoreModuleWithConf(configuration, 'source')
      : this.registerToNextEventStoreModuleWithConf(configuration, 'source');
  }

  public static getDestinationEventStoreModule(
    configuration: InterconnectionConfiguration,
  ): DynamicModule {
    return ConfigurationsHelper.isLegacyConf(configuration.destination)
      ? this.registerToLegacyEventStoreModuleWithConf(configuration, 'dest')
      : this.registerToNextEventStoreModuleWithConf(configuration, 'dest');
  }

  private static registerToLegacyEventStoreModuleWithConf(
    configuration: InterconnectionConfiguration,
    entry: 'source' | 'dest',
  ): DynamicModule {
    const { tcp, http, credentials } =
      entry === 'source' ? configuration.source : configuration.destination;
    return CqrsEventStoreModuleLegacy.register(
      {
        tcp: {
          host:
            (entry === 'source'
              ? process.env.EVENTSTORE_INTERCO_TCP_ENDPOINT_SRC
              : process.env.EVENTSTORE_INTERCO_TCP_ENDPOINT_DST) || tcp.host,
          port:
            (entry === 'source'
              ? +process.env.EVENTSTORE_INTERCO_TCP_PORT_SRC
              : +process.env.EVENTSTORE_INTERCO_TCP_PORT_DST) || tcp.port,
        },
        http: {
          host:
            (entry === 'source'
              ? process.env.EVENTSTORE_INTERCO_HTTP_ENDPOINT_SRC
              : process.env.EVENTSTORE_INTERCO_HTTP_ENDPOINT_DST) || http.host,
          port:
            (entry === 'source'
              ? +process.env.EVENTSTORE_INTERCO_HTTP_PORT_SRC
              : +process.env.EVENTSTORE_INTERCO_HTTP_PORT_DST) || http.port,
        },
        credentials: {
          username:
            (entry === 'source'
              ? process.env.EVENTSTORE_INTERCO_CREDENTIALS_USERNAME_SRC
              : process.env.EVENTSTORE_INTERCO_CREDENTIALS_USERNAME_DEST) ||
            credentials.username,
          password:
            (entry === 'source'
              ? process.env.EVENTSTORE_INTERCO_CREDENTIALS_PASSWORD_SRC
              : process.env.EVENTSTORE_INTERCO_CREDENTIALS_PASSWORD_DST) ||
            credentials.password,
        },
      },
      configuration.eventStoreServiceConfig,
    );
  }

  private static registerToNextEventStoreModuleWithConf(
    configuration: InterconnectionConfiguration,
    entry: 'source' | 'dest',
  ): DynamicModule {
    const { connectionString, credentials } =
      entry === 'source' ? configuration.source : configuration.destination;
    const { eventStoreSubsystems } = configuration;
    return CqrsEventStoreModuleNext.register(
      {
        connectionSettings: {
          connectionString:
            (entry === 'source'
              ? process.env.EVENTSTORE_INTERCO_CONNECTION_STRING_SRC
              : process.env.EVENTSTORE_INTERCO_CONNECTION_STRING_DST) ||
            connectionString,
        },
        defaultUserCredentials: {
          username:
            (entry === 'source'
              ? process.env.EVENTSTORE_INTERCO_CREDENTIALS_USERNAME_SRC
              : process.env.EVENTSTORE_INTERCO_CREDENTIALS_USERNAME_DST) ||
            credentials.username,
          password:
            (entry === 'source'
              ? process.env.EVENTSTORE_INTERCO_CREDENTIALS_PASSWORD_SRC
              : process.env.EVENTSTORE_INTERCO_CREDENTIALS_PASSWORD_DST) ||
            credentials.password,
        },
      },
      eventStoreSubsystems,
      { read: { allowedEvents: {} }, write: { serviceName: 'test' } },
    );
  }
}
