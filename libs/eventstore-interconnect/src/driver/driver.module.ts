import { DynamicModule, Module, Type } from '@nestjs/common';
import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';
import {
  ConnectionConfiguration,
  Credentials,
  InterconnectionConfiguration,
  isLegacyConf,
  ReaderModule,
  SafetyNet,
} from '..';
import { DRIVER } from './driver';
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
import {
  CREDENTIALS,
  INTERCONNECTION_CONNECTION_DEFAULT_NAME,
} from '../constants';
import { NoGrpcConnectionError } from './errors/no-grpc-connection.error';
import * as geteventstorePromise from 'geteventstore-promise';
import { HTTPClient } from 'geteventstore-promise';
import { SafetyNetModule } from '../safety-net';
import { nanoid } from 'nanoid';

@Module({})
export class DriverModule {
  public static get(
    configuration: InterconnectionConfiguration,
    customSafetyNetStrategy?: Type<SafetyNet>,
  ): DynamicModule {
    const driverProviders: Provider[] = isLegacyConf(configuration.destination)
      ? this.getLegacyEventStoreDriver(
          configuration.destination,
          configuration.connectionLabel,
        )
      : this.getNextEventStoreDriver(
          configuration.destination.connectionString,
          configuration.destination.credentials,
        );

    return {
      module: DriverModule,
      imports: [SafetyNetModule.use(customSafetyNetStrategy)],
      providers: [...driverProviders],
      exports: [...driverProviders, SafetyNetModule],
    };
  }

  private static getNextEventStoreDriver(
    connectionString: string,
    credentials: Credentials,
  ): Provider[] {
    return [
      this.getGrpcDriverProvider(DRIVER),
      {
        provide: CREDENTIALS,
        useValue: credentials,
      },
      {
        provide: EVENT_STORE_CONNECTOR,
        useFactory: async () => {
          const eventStoreConnector: Client =
            EventStoreDBClient.connectionString(connectionString);
          await this.checkNextConnectionStatus(
            eventStoreConnector,
            connectionString,
          );
          console.log(
            'DRIVER : Connected to Next eventstore on ' + connectionString,
          );
          return eventStoreConnector;
        },
      },
    ];
  }

  public static async checkNextConnectionStatus(
    eventStoreConnector: Client,
    connectionString: string,
  ): Promise<void> {
    try {
      await eventStoreConnector.getStreamMetadata('$all');
    } catch (errMessage) {
      throw new NoGrpcConnectionError(errMessage, connectionString);
    }
  }

  private static getLegacyEventStoreDriver(
    configuration: ConnectionConfiguration,
    connectionLabel?: string,
  ): Provider[] {
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

    console.log(
      'DRIVER : Connected to legacy eventstore at ' +
        tcpEndPoint.host +
        ':' +
        tcpEndPoint.port,
    );

    return [
      this.getHttpDriverProvider(DRIVER),
      {
        provide: CREDENTIALS,
        useValue: configuration.credentials,
      },
      {
        provide: HTTP_CLIENT,
        useFactory: async () => {
          const httpClient: HTTPClient = new geteventstorePromise.HTTPClient({
            hostname: configuration.http.host.replace(/^https?:\/\//, ''),
            port: configuration.http.port,
            credentials: {
              username: configuration.credentials.username,
              password: configuration.credentials.password,
            },
          });
          const eventStoreConnection: EventStoreNodeConnection =
            createConnection(
              esConnectionConf,
              tcpEndPoint,
              connectionLabel ??
                `${INTERCONNECTION_CONNECTION_DEFAULT_NAME}-${nanoid(11)}`,
            );
          await eventStoreConnection.connect();

          await ReaderModule.checkLegacyConnectionStatus(
            httpClient,
            tcpEndPoint,
          );
          return eventStoreConnection;
        },
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
