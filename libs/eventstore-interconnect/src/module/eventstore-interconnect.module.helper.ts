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
        tcp,
        http,
        credentials,
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
        connectionSettings: { connectionString },
        defaultUserCredentials: credentials,
      },
      eventStoreSubsystems,
      { read: { allowedEvents: {} }, write: { serviceName: 'test' } },
    );
  }
}
