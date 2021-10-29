import { DynamicModule } from '@nestjs/common';
import { CqrsEventStoreModule as CqrsEventStoreModuleLegacy } from 'nestjs-geteventstore-legacy/dist/cqrs-event-store.module';
import { CqrsEventStoreModule as CqrsEventStoreModuleNext } from 'nestjs-geteventstore-next/dist/cqrs-event-store.module';
import { InterconnectionConfiguration } from '../interconnection-configuration';
import {
  getConnectionString,
  getLegacyHttpHost,
  getLegacyHttpPort,
  getLegacyPassword,
  getLegacyTcpHost,
  getLegacyTcpPort,
  getLegacyUsername,
  getNextPassword,
  getNextUsername,
  isLegacyConf,
} from './configurations.helper';

export default class EventstoreInterconnectModuleHelper {
  public static getSourceEventStoreModule(
    configuration: InterconnectionConfiguration,
  ): DynamicModule {
    return isLegacyConf(configuration.source)
      ? this.registerToLegacyEventStoreModuleWithConf(configuration, 'source')
      : this.registerToNextEventStoreModuleWithConf(configuration, 'source');
  }

  public static getDestinationEventStoreModule(
    configuration: InterconnectionConfiguration,
  ): DynamicModule {
    return isLegacyConf(configuration.destination)
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
          host: getLegacyTcpHost(entry, tcp.host),
          port: getLegacyTcpPort(entry, tcp.port),
        },
        http: {
          host: getLegacyHttpHost(entry, http.host),
          port: getLegacyHttpPort(entry, http.port),
        },
        credentials: {
          username: getLegacyUsername(entry, credentials.username),
          password: getLegacyPassword(entry, credentials.password),
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
          connectionString: getConnectionString(entry, connectionString),
        },
        defaultUserCredentials: {
          username: getNextUsername(entry, credentials.username),
          password: getNextPassword(entry, credentials.password),
        },
      },
      eventStoreSubsystems,
      { read: { allowedEvents: {} }, write: { serviceName: 'test' } },
    );
  }
}
