import { DynamicModule, Module } from '@nestjs/common';
import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';
import {
  ConnectionConfiguration,
  Credentials,
  InterconnectionConfiguration,
  isLegacyConf,
} from '..';
import { DRIVER } from './services/driver';
import { HttpDriverService } from './services/http-driver/http-driver.service';
import { GrpcDriverService } from './services/grpc-driver/grpc-driver.service';
import { Client } from '@eventstore/db-client/dist/Client';
import { EVENT_STORE_CONNECTOR } from 'nestjs-geteventstore-next/dist/event-store/services/event-store.constants';
import { EventStoreDBClient } from '@eventstore/db-client';
import {
  ConnectionSettings,
  createConnection,
  EventStoreNodeConnection,
} from 'node-eventstore-client';
import { HTTP_CLIENT } from './services/http-driver/http-connection.constants';
import { CREDENTIALS } from '../constants';

@Module({})
export class DriverModule {
  public static async get(
    configuration: InterconnectionConfiguration,
  ): Promise<DynamicModule> {
    const driverProviders: Provider[] = isLegacyConf(configuration.destination)
      ? await this.getLegacyEventStoreDriver(configuration.destination)
      : this.getNextEventStoreDriver(
          configuration.destination.connectionString,
          configuration.destination.credentials,
        );

    return {
      module: DriverModule,
      providers: [...driverProviders],
      exports: [...driverProviders],
    };
  }

  public static async forLegacySrc(
    configuration: ConnectionConfiguration,
  ): Promise<DynamicModule> {
    const driverProviders: Provider[] = await this.getLegacyEventStoreDriver(
      configuration,
    );

    return {
      module: DriverModule,
      providers: [...driverProviders],
      exports: [...driverProviders],
    };
  }

  public static async forNextSrc(
    configuration: ConnectionConfiguration,
  ): Promise<DynamicModule> {
    const driverProviders: Provider[] = this.getNextEventStoreDriver(
      configuration.connectionString,
      configuration.credentials,
    );

    return {
      module: DriverModule,
      providers: [...driverProviders],
      exports: [...driverProviders],
    };
  }

  private static getNextEventStoreDriver(
    connectionString: string,
    credentials: Credentials,
  ) {
    const eventStoreConnector: Client =
      EventStoreDBClient.connectionString(connectionString);

    return [
      this.getGrpcDriverProvider(DRIVER),
      {
        provide: CREDENTIALS,
        useValue: credentials,
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
    eventStoreConnection.once('connected', function (tcpEndPoint) {
      console.log(
        'DRIVER : Connected to eventstore at ' +
          tcpEndPoint.host +
          ':' +
          tcpEndPoint.port,
      );
    });

    return [
      this.getHttpDriverProvider(DRIVER),
      {
        provide: CREDENTIALS,
        useValue: configuration.credentials,
      },
      {
        provide: HTTP_CLIENT,
        useValue: eventStoreConnection,
      },
    ];
  }

  public static getGrpcDriverProvider(injectorSymbol: symbol): Provider {
    return {
      provide: injectorSymbol,
      useClass: GrpcDriverService,
    };
  }

  public static getHttpDriverProvider(injectorSymbol: symbol): Provider {
    return {
      provide: injectorSymbol,
      useClass: HttpDriverService,
    };
  }
}
