import InterconnectionConfiguration, {
  LegacyEventStoreConfiguration,
  NextEventStoreConfiguration,
} from '../interconnection-configuration';
import { DynamicModule } from '@nestjs/common';
import { CqrsEventStoreModule as CqrsEventStoreModuleLegacy } from 'nestjs-geteventstore-legacy/dist/cqrs-event-store.module';
import { CqrsEventStoreModule as CqrsEventStoreModuleNext } from 'nestjs-geteventstore-next/dist/cqrs-event-store.module';
import { ConfigurationsHelper } from './configurations.helper';

export default class EventstoreInterconnectModuleHelper {
  public static getSourceEventStoreModule(
    configuration: InterconnectionConfiguration,
  ): DynamicModule {
    return ConfigurationsHelper.isLegacyConf(
      configuration.sourceEventStoreConfiguration,
    )
      ? this.registerToLegacyEventStoreModuleWithConf(
          configuration.sourceEventStoreConfiguration,
        )
      : this.registerToNextEventStoreModuleWithConf(
          configuration.sourceEventStoreConfiguration,
        );
  }

  public static getDestinationEventStoreModule(
    configuration: InterconnectionConfiguration,
  ): DynamicModule {
    return ConfigurationsHelper.isLegacyConf(
      configuration.destEventStoreConfiguration,
    )
      ? this.registerToLegacyEventStoreModuleWithConf({
          connectionConfig:
            configuration.destEventStoreConfiguration.connectionConfig,
          eventStoreServiceConfig:
            configuration.destEventStoreConfiguration.eventStoreServiceConfig,
          eventBusConfig: {},
        })
      : this.registerToNextEventStoreModuleWithConf({
          eventStoreConfig:
            configuration.destEventStoreConfiguration.eventStoreConfig,
          eventStoreSubsystems:
            configuration.destEventStoreConfiguration.eventStoreSubsystems,
          eventBusConfig: { read: { allowedEvents: {} } },
        });
  }

  private static registerToLegacyEventStoreModuleWithConf(
    configuration: LegacyEventStoreConfiguration,
  ): DynamicModule {
    const { connectionConfig, eventStoreServiceConfig, eventBusConfig } =
      configuration;
    return CqrsEventStoreModuleLegacy.register(
      connectionConfig,
      eventStoreServiceConfig,
      eventBusConfig,
    );
  }

  private static registerToNextEventStoreModuleWithConf(
    configuration: NextEventStoreConfiguration,
  ): DynamicModule {
    const { eventStoreConfig, eventStoreSubsystems, eventBusConfig } =
      configuration;
    return CqrsEventStoreModuleNext.register(
      eventStoreConfig,
      eventStoreSubsystems,
      eventBusConfig,
    );
  }
}
