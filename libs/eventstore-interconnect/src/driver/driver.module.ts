import { DynamicModule, Module } from '@nestjs/common';
import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';
import { HTTPClient } from 'geteventstore-promise';
import { ConnectionConfiguration, InterconnectionConfiguration } from '..';
import { DRIVER, GrpcDriverService, HttpDriverService } from './index';
import { ConfigurationsHelper as legal } from '../module/configurations.helper';
import { Client } from '@eventstore/db-client/dist/Client';
import { EVENT_STORE_CONNECTOR } from 'nestjs-geteventstore-next/dist/event-store/services/event-store.constants';
import { EventStoreDBClient } from '@eventstore/db-client';
import { EVENT_STORE_SERVICE } from 'nestjs-geteventstore-next/dist/event-store/services/event-store.service.interface';
import { EventStoreService } from 'nestjs-geteventstore-next';

@Module({})
export class DriverModule {
  public static get(
    configuration: InterconnectionConfiguration,
  ): DynamicModule {
    const driverProviders: Provider[] = legal.isLegacyConf(
      configuration.destination,
    )
      ? this.getLegacyEventStoreDriver(configuration.destination)
      : this.getNextEventStoreDriver(
          configuration.destination.connectionString,
        );

    return {
      module: DriverModule,
      providers: [...driverProviders],
      exports: [...driverProviders],
    };
  }

  private static getNextEventStoreDriver(connectionString: string) {
    const eventStoreConnector: Client =
      EventStoreDBClient.connectionString(connectionString);

    return [
      {
        provide: DRIVER,
        useClass: GrpcDriverService,
      },
      {
        provide: EVENT_STORE_CONNECTOR,
        useValue: eventStoreConnector,
      },
      {
        provide: EVENT_STORE_SERVICE,
        useExisting: EventStoreService,
      },
    ];
  }

  private static getLegacyEventStoreDriver(
    configuration: ConnectionConfiguration,
  ) {
    return [
      {
        provide: DRIVER,
        useClass: HttpDriverService,
      },
      {
        provide: HTTPClient,
        useValue: new HTTPClient({
          hostname: configuration.http.host,
          port: configuration.http.port,
          credentials: configuration.credentials,
        }),
      },
    ];
  }
}
