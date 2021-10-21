import { DynamicModule, Logger, Module } from '@nestjs/common';
import { EventstoreInterconnectService } from './eventstore-interconnect.service';
import InterconnectionConfiguration, {
  LatestEventStoreConfiguration,
  LegacyEventStoreConfiguration,
} from './interconnection-configuration';
import { CqrsEventStoreModule } from 'nestjs-geteventstore-4.0.1';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { sentryForFacebookConfiguration } from '../../../apps/usecase1/src/configuration/sentry-facebook';
import { SecondaryConnectionService } from '../../../apps/usecase1/src/secondary-connection.service';

@Module({
  imports: [Logger, SentryModule.forRoot(sentryForFacebookConfiguration)],
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
        ? CqrsEventStoreModule.register(
            configuration.sourceEventStoreConfiguration.connectionConfig,
            configuration.sourceEventStoreConfiguration.eventStoreBusConfig,
          )
        : CqrsEventStoreModule.register(
            // @ts-ignore
            configuration.sourceEventStoreConfiguration.connectionConfig,
            // @ts-ignore
            configuration.sourceEventStoreConfiguration.eventStoreBusConfig,
          );
    const eventStoreModuleDest: DynamicModule =
      EventstoreInterconnectModule.isLegacyConf(
        configuration.destEventStoreConfiguration,
      )
        ? CqrsEventStoreModule.register(
            configuration.destEventStoreConfiguration.connectionConfig,
            configuration.sourceEventStoreConfiguration.eventStoreBusConfig,
          )
        : CqrsEventStoreModule.register(
            // @ts-ignore
            configuration.destEventStoreConfiguration.connectionConfig,
            configuration.sourceEventStoreConfiguration.eventStoreBusConfig,
          );
    return {
      module: EventstoreInterconnectModule,
      providers: [
        {
          provide: SecondaryConnectionService,
          useValue: new SecondaryConnectionService(
            configuration.sourceEventStoreConfiguration.connectionConfig,
          ),
        },
      ],
      imports: [eventStoreModuleSource, eventStoreModuleDest],
      exports: [
        eventStoreModuleSource,
        eventStoreModuleDest,
        SecondaryConnectionService,
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
