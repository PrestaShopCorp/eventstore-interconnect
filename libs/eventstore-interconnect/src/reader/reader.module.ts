import { DynamicModule, Module, Type } from '@nestjs/common';
import {
  InterconnectionConfiguration,
  ProtocolConf,
} from '../interconnection-configuration';
import { READER } from './services/reader';
import { isLegacyConf } from '../helpers/configurations.helper';
import { HttpReaderService } from './services/http-reader/http-reader.service';
import { GrpcReaderService } from './services/grpc-reader/grpc-reader.service';
import { EVENT_STORE_CONNECTOR } from 'nestjs-geteventstore-next/dist/event-store/services/event-store.constants';
import { Client } from '@eventstore/db-client/dist/Client';
import { EventStoreDBClient } from '@eventstore/db-client';
import {
  EVENTSTORE_PERSISTENT_CONNECTION,
  HTTP_CLIENT,
} from './services/http-reader/http-connection.constants';
import {
  ConnectionSettings,
  createConnection,
  EventStoreNodeConnection,
} from 'node-eventstore-client';
import { SUBSCRIPTIONS } from '../reader/services/constants';
import * as geteventstorePromise from 'geteventstore-promise';
import { HTTPClient } from 'geteventstore-promise';
import { Logger } from 'nestjs-pino-stackdriver';
import {
  ALLOWED_EVENTS,
  CREDENTIALS,
  INTERCONNECTION_CONNECTION_DEFAULT_NAME,
} from '../constants';
import { LegacyEventsValidatorService } from '../validator';
import { DriverModule } from '../driver';
import { EventStoreService } from './services/grpc-reader/event-store.service';
import { NextEventsValidatorService } from '../validator/next/next-events-validator.service';
import { VALIDATOR } from '../validator/validator';
import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';
import { NoLegacyConnectionError } from './errors/no-legacy-connection.error';
import { EVENT_HANDLER, EventHandlerService } from '../event-handler';
import {
  FORMATTER,
  LegacyEventFormatterService,
  NextEventFormatterService,
} from '../formatter';
import { SafetyNet } from '../safety-net';
import { nanoid } from 'nanoid';

@Module({})
export class ReaderModule {
  public static get(
    configuration: InterconnectionConfiguration,
    allowedEvents?: Type<SafetyNet>,
    customStrategy?: Type<SafetyNet>,
  ): DynamicModule {
    const providersForReader: Provider[] = isLegacyConf(configuration.source)
      ? ReaderModule.getLegacyReaderProviders(configuration)
      : ReaderModule.getNextReaderProviders(configuration);
    return {
      module: ReaderModule,
      imports: [DriverModule.get(configuration, customStrategy)],
      exports: [DriverModule],
      providers: [
        ...providersForReader,
        {
          provide: ALLOWED_EVENTS,
          useValue: allowedEvents ?? {},
        },
      ],
    };
  }

  private static getLegacyReaderProviders(
    configuration: InterconnectionConfiguration,
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

    const tcpEndPoint: ProtocolConf = {
      host: configuration.source.tcp.host,
      port: configuration.source.tcp.port,
    };

    return [
      {
        provide: READER,
        useClass: HttpReaderService,
      },
      {
        provide: HTTP_CLIENT,
        useFactory: async () => {
          const httpClient: HTTPClient = new geteventstorePromise.HTTPClient({
            hostname: configuration.source.http.host.replace(
              /^https?:\/\//,
              '',
            ),
            port: configuration.source.http.port,
            credentials: {
              username: configuration.source.credentials.username,
              password: configuration.source.credentials.password,
            },
          });
          await this.checkLegacyConnectionStatus(httpClient, tcpEndPoint);
          return httpClient;
        },
      },
      {
        provide: EVENTSTORE_PERSISTENT_CONNECTION,
        useFactory: async () => {
          console.log(
            'configuration.source.tcpConnectionName : ',
            configuration.source.tcpConnectionName ??
              `${INTERCONNECTION_CONNECTION_DEFAULT_NAME}-${nanoid(11)}`,
          );
          const eventStoreConnection: EventStoreNodeConnection =
            createConnection(
              esConnectionConf,
              tcpEndPoint,
              configuration.source.tcpConnectionName ??
                `${INTERCONNECTION_CONNECTION_DEFAULT_NAME}-${nanoid(11)}`,
            );
          await eventStoreConnection.connect();

          console.log(
            'READER : Connected to legacy eventstore at ' +
              tcpEndPoint.host +
              ':' +
              tcpEndPoint.port,
          );

          return eventStoreConnection;
        },
      },
      {
        provide: SUBSCRIPTIONS,
        useValue: configuration.eventStoreBusConfig.subscriptions.persistent,
      },
      {
        provide: CREDENTIALS,
        useValue: configuration.source.credentials,
      },
      {
        provide: EVENT_HANDLER,
        useClass: EventHandlerService,
      },
      Logger,
      {
        provide: VALIDATOR,
        useClass: LegacyEventsValidatorService,
      },
      {
        provide: FORMATTER,
        useClass: LegacyEventFormatterService,
      },
    ];
  }

  public static async checkLegacyConnectionStatus(
    httpClient: HTTPClient,
    tcpEndPoint: ProtocolConf,
  ): Promise<void> {
    try {
      await httpClient.checkStreamExists('$all');
    } catch (errMessage) {
      throw new NoLegacyConnectionError(errMessage, tcpEndPoint);
    }
  }

  private static getNextReaderProviders(
    configuration: InterconnectionConfiguration,
  ): Provider[] {
    console.log(
      'READER : Connected to Next eventstore on ' +
        configuration.source.connectionString,
    );

    return [
      {
        provide: READER,
        useClass: GrpcReaderService,
      },
      {
        provide: EVENT_STORE_CONNECTOR,
        useFactory: async () => {
          const eventStoreConnector: Client =
            EventStoreDBClient.connectionString(
              configuration.source.connectionString,
            );
          await DriverModule.checkNextConnectionStatus(
            eventStoreConnector,
            configuration.source.connectionString,
          );
          return eventStoreConnector;
        },
      },
      {
        provide: EVENT_HANDLER,
        useClass: EventHandlerService,
      },
      EventStoreService,
      Logger,
      {
        provide: SUBSCRIPTIONS,
        useValue: configuration.eventStoreSubsystems.subscriptions.persistent,
      },
      {
        provide: VALIDATOR,
        useClass: NextEventsValidatorService,
      },
      {
        provide: FORMATTER,
        useClass: NextEventFormatterService,
      },
    ];
  }
}
