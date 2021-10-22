import InterconnectionConfiguration, {
  LegacyEventStoreConfiguration,
  NextEventStoreConfiguration,
} from '@eventstore-interconnect/interconnection-configuration';
import { DynamicModule } from '@nestjs/common';
import { CqrsEventStoreModule as CqrsEventStoreModuleLegacy } from 'nestjs-geteventstore-legacy/dist/cqrs-event-store.module';
import { CqrsEventStoreModule as CqrsEventStoreModuleNext } from 'nestjs-geteventstore-next/dist/cqrs-event-store.module';
import { HTTPClient } from 'geteventstore-promise';
import { IEventStoreConfig } from 'nestjs-geteventstore-legacy';

export default class EventstoreInterconnectModuleHelper {
  public static getSourceEventStoreModule(
    configuration: InterconnectionConfiguration,
  ): DynamicModule {
    return this.isLegacyConf(configuration.sourceEventStoreConfiguration)
      ? this.registerToLegacyEventStoreModuleWithConf(configuration)
      : this.registerToNextEventStoreModuleWithConf(configuration);
  }

  public static getDestinationEventStoreModule(
    configuration: InterconnectionConfiguration,
  ): DynamicModule {
    return this.isLegacyConf(configuration.destEventStoreConfiguration)
      ? this.registerToLegacyEventStoreModuleWithConf(configuration)
      : this.registerToNextEventStoreModuleWithConf(configuration);
  }

  public static registerToLegacyEventStoreModuleWithConf(
    configuration: InterconnectionConfiguration,
  ) {
    const { connectionConfig, eventStoreServiceConfig, eventBusConfig } =
      configuration.destEventStoreConfiguration as LegacyEventStoreConfiguration;
    return CqrsEventStoreModuleLegacy.register(
      connectionConfig,
      eventStoreServiceConfig,
      eventBusConfig,
    );
  }

  public static registerToNextEventStoreModuleWithConf(
    configuration: InterconnectionConfiguration,
  ) {
    const { eventStoreConfig, eventStoreSubsystems, eventBusConfig } =
      configuration.destEventStoreConfiguration as NextEventStoreConfiguration;
    return CqrsEventStoreModuleNext.register(
      eventStoreConfig,
      eventStoreSubsystems,
      eventBusConfig,
    );
  }

  public static getHttpClientProvider(
    configuration: InterconnectionConfiguration,
  ) {
    const connectionConfig: IEventStoreConfig = (
      configuration.destEventStoreConfiguration as LegacyEventStoreConfiguration
    ).connectionConfig;
    return {
      provide: HTTPClient,
      useValue: new HTTPClient({
        hostname: connectionConfig.http.host,
        port: connectionConfig.http.port,
        credentials: connectionConfig.credentials,
      }),
    };
  }

  private static isLegacyConf(
    configuration: LegacyEventStoreConfiguration | NextEventStoreConfiguration,
  ): configuration is LegacyEventStoreConfiguration {
    return (
      (configuration as LegacyEventStoreConfiguration).connectionConfig.http !==
      undefined
    );
  }
}
