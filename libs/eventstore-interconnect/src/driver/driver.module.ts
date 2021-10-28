import { DynamicModule, Module } from '@nestjs/common';
import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';
import { ConnectionConfiguration, InterconnectionConfiguration } from '..';
import { DRIVER } from './services/driver.interface';
import { HttpDriverService } from './services/http-driver/http-driver.service';
import { GrpcDriverService } from './services/grpc-driver/grpc-driver.service';
import { ConfigurationsHelper as legal } from '../module/configurations.helper';
import { Client } from '@eventstore/db-client/dist/Client';
import { EVENT_STORE_CONNECTOR } from 'nestjs-geteventstore-next/dist/event-store/services/event-store.constants';
import { EventStoreDBClient } from '@eventstore/db-client';
import {
  ConnectionSettings,
  createConnection,
  EventStoreNodeConnection,
} from 'node-eventstore-client';
import { HTTP_CLIENT } from './services/http-driver/http-connection.constants';

@Module({})
export class DriverModule {
  public static async get(
    configuration: InterconnectionConfiguration,
  ): Promise<DynamicModule> {
    const driverProviders: Provider[] = legal.isLegacyConf(
      configuration.destination,
    )
      ? await this.getLegacyEventStoreDriver(configuration.destination)
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
    ];
  }

  private static async getLegacyEventStoreDriver(
    configuration: ConnectionConfiguration,
  ) {
    const esConnectionConf: ConnectionSettings = {
      // Buffer events if remote is slow or not available
      maxQueueSize: 100_000,
      maxRetries: 10_000,
      operationTimeout: 5_000,
      operationTimeoutCheckPeriod: 1_000,
      // Fail fast on connect
      clientConnectionTimeout: 2_000,
      failOnNoServerResponse: true,
      // Try to reconnect every 10s for 30mn
      maxReconnections: 200,
      reconnectionDelay: 10_000,
      // Production heartbeat
      heartbeatInterval: 10_000,
      heartbeatTimeout: 3_000,
    };

    const tcpEndPoint = {
      host: configuration.tcp.host,
      port: configuration.tcp.port,
    };

    const eventStoreConnection: EventStoreNodeConnection = createConnection(
      esConnectionConf,
      tcpEndPoint,
      'interco-module-connection',
    );
    await eventStoreConnection.connect();

    return [
      { provide: DRIVER, useClass: HttpDriverService },
      {
        provide: HTTP_CLIENT,
        useValue: eventStoreConnection,
      },
    ];
  }
}
