import { DynamicModule } from '@nestjs/common';
import { CqrsEventStoreModule as CqrsEventStoreModuleNext } from 'nestjs-geteventstore-next/dist/cqrs-event-store.module';
import { InterconnectionConfiguration } from '../interconnection-configuration';
import {
  getConnectionString,
  getNextPassword,
  getNextUsername,
  isLegacyConf,
} from '../helpers/configurations.helper';
import { ReaderModule } from '../reader';
import { DriverModule } from '../driver';
import { LegacyModule } from './legacy.module';

export default class EventstoreInterconnectModuleHelper {
  public static getSourceEventStoreModule(
    configuration: InterconnectionConfiguration,
    allowedEvents: any,
  ): DynamicModule {
    return isLegacyConf(configuration.source)
      ? this.registerToLegacyEventStoreModuleWithConf(
          configuration,
          'source',
          allowedEvents,
        )
      : this.registerToNextEventStoreModuleWithConf(
          configuration,
          'source',
          allowedEvents,
        );
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
    allowedEvents?: any,
  ): DynamicModule {
    return entry === 'source'
      ? {
          module: LegacyModule,
          imports: [ReaderModule.get(configuration, allowedEvents)],
          exports: [ReaderModule],
        }
      : {
          module: LegacyModule,
          imports: [DriverModule.get(configuration)],
          exports: [DriverModule],
        };
  }

  private static registerToNextEventStoreModuleWithConf(
    configuration: InterconnectionConfiguration,
    entry: 'source' | 'dest',
    allowedEvents?: any,
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
