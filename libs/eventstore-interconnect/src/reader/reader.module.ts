import { EventStoreDBClient } from '@eventstore/db-client';
import { Client } from '@eventstore/db-client/dist/Client';
import { DynamicModule, Module } from '@nestjs/common';
import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';
import * as geteventstorePromise from 'geteventstore-promise';
import { HTTPClient } from 'geteventstore-promise';
import { nanoid } from 'nanoid';
import { EVENT_STORE_CONNECTOR } from 'nestjs-geteventstore-next/dist/event-store/services/event-store.constants';
import { Logger } from 'nestjs-pino-stackdriver';
import {
  ConnectionSettings,
  createConnection,
  EventStoreNodeConnection,
} from 'node-eventstore-client';
import { ALLOWED_EVENTS, CREDENTIALS } from '../constants';
import { DriverModule } from '../driver';
import { EventHandlerService, EVENT_HANDLER } from '../event-handler';
import {
  FORMATTER,
  LegacyEventFormatterService,
  NextEventFormatterService,
} from '../formatter';
import { isLegacyConf } from '../helpers/configurations.helper';
import {
  InterconnectionConfiguration,
  ProtocolConf,
} from '../interconnection-configuration';
import { SUBSCRIPTIONS } from '../reader/services/constants';
import { LegacyEventsValidatorService } from '../validator';
import { NextEventsValidatorService } from '../validator/next/next-events-validator.service';
import { VALIDATOR } from '../validator/validator';
import { NoLegacyConnectionError } from './errors/no-legacy-connection.error';
import { EventStoreService } from './services/grpc-reader/event-store.service';
import { GrpcReaderService } from './services/grpc-reader/grpc-reader.service';
import {
  EVENTSTORE_PERSISTENT_CONNECTION,
  HTTP_CLIENT,
} from './services/http-reader/http-connection.constants';
import { HttpReaderService } from './services/http-reader/http-reader.service';
import { READER } from './services/reader';

@Module({})
export class ReaderModule {
  public static async get(
    configuration: InterconnectionConfiguration,
    allowedEvents?: any,
  ): Promise<DynamicModule> {
    const providersForReader: Provider[] = isLegacyConf(configuration.source)
      ? await ReaderModule.getLegacyReaderProviders(configuration)
      : await ReaderModule.getNextReaderProviders(configuration);
    return {
      module: ReaderModule,
      imports: [await DriverModule.get(configuration)],
      providers: [
        ...providersForReader,
        {
          provide: ALLOWED_EVENTS,
          useValue: allowedEvents ?? {},
        },
      ],
    };
  }

  private static async getLegacyReaderProviders(
    configuration: InterconnectionConfiguration,
  ): Promise<Provider[]> {
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

    const randomId = nanoid(11);
    const connectionString =
      configuration.source.connectionString ||
      configuration.source.tcpConnectionName ||
      `interco-module-connection-${randomId}`;

    const tcpEndPoint: ProtocolConf = {
      host: configuration.source.tcp.host,
      port: configuration.source.tcp.port,
    };

    const eventStoreConnection: EventStoreNodeConnection = createConnection(
      esConnectionConf,
      tcpEndPoint,
      connectionString,
    );
    await eventStoreConnection.connect();

    const httpClient: HTTPClient = new geteventstorePromise.HTTPClient({
      hostname: configuration.source.http.host.replace(/^https?:\/\//, ''),
      port: configuration.source.http.port,
      credentials: {
        username: configuration.source.credentials.username,
        password: configuration.source.credentials.password,
      },
    });

    await this.checkLegacyConnectionStatus(httpClient, tcpEndPoint);

    console.log(
      'READER : Connected to legacy eventstore at ' +
        tcpEndPoint.host +
        ':' +
        tcpEndPoint.port,
    );

    return [
      {
        provide: READER,
        useClass: HttpReaderService,
      },
      {
        provide: HTTP_CLIENT,
        useValue: httpClient,
      },
      {
        provide: EVENTSTORE_PERSISTENT_CONNECTION,
        useValue: eventStoreConnection,
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

  private static async getNextReaderProviders(
    configuration: InterconnectionConfiguration,
  ): Promise<Provider[]> {
    const eventStoreConnector: Client = EventStoreDBClient.connectionString(
      configuration.source.connectionString,
    );
    await DriverModule.checkNextConnectionStatus(
      eventStoreConnector,
      configuration.source.connectionString,
    );

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
        useValue: eventStoreConnector,
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
