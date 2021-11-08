import { DynamicModule, Module } from '@nestjs/common';
import { InterconnectionConfiguration } from '../interconnection-configuration';
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
import { ALLOWED_EVENTS, CREDENTIALS } from '../constants';
import { LegacyEventsValidatorService } from './services/validator';
import { DriverModule } from '../driver';
import { EventStoreService } from './services/grpc-reader/event-store.service';
import { NextEventsValidatorService } from './services/validator/next/next-events-validator.service';
import { VALIDATOR } from './services/validator/validator';

@Module({})
export class ReaderModule {
  public static async get(
    configuration: InterconnectionConfiguration,
    allowedEvents?: any,
  ): Promise<DynamicModule> {
    return isLegacyConf(configuration.source)
      ? ReaderModule.getLegacyReaderModule(configuration, allowedEvents)
      : ReaderModule.getNextReaderModule(configuration, allowedEvents);
  }

  private static async getLegacyReaderModule(
    configuration: InterconnectionConfiguration,
    allowedEvents?: any[],
  ): Promise<DynamicModule> {
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
      host: configuration.source.tcp.host,
      port: configuration.source.tcp.port,
    };

    const eventStoreConnection: EventStoreNodeConnection = createConnection(
      esConnectionConf,
      tcpEndPoint,
      'interco-module-connection',
    );
    await eventStoreConnection.connect();
    eventStoreConnection.once('connected', function (tcpEndPoint) {
      console.log(
        'READER : Connected to eventstore at ' +
          tcpEndPoint.host +
          ':' +
          tcpEndPoint.port,
      );
    });

    const httpClient: HTTPClient = new geteventstorePromise.HTTPClient({
      hostname: configuration.source.http.host.replace(/^https?:\/\//, ''),
      port: configuration.source.http.port,
      credentials: {
        username: configuration.source.credentials.username,
        password: configuration.source.credentials.password,
      },
    });

    return {
      module: ReaderModule,
      imports: [await DriverModule.get(configuration)],
      providers: [
        Logger,
        {
          provide: VALIDATOR,
          useClass: LegacyEventsValidatorService,
        },

        {
          provide: ALLOWED_EVENTS,
          useValue: allowedEvents ?? {},
        },
        {
          provide: READER,
          useClass: HttpReaderService,
        },
        {
          provide: CREDENTIALS,
          useValue: configuration.destination.credentials,
        },
        {
          provide: EVENTSTORE_PERSISTENT_CONNECTION,
          useValue: eventStoreConnection,
        },
        {
          provide: HTTP_CLIENT,
          useValue: httpClient,
        },
        {
          provide: SUBSCRIPTIONS,
          useValue: configuration.eventStoreBusConfig.subscriptions.persistent,
        },
      ],
    };
  }

  private static async getNextReaderModule(
    configuration: InterconnectionConfiguration,
    allowedEvents?: any,
  ): Promise<DynamicModule> {
    const eventStoreConnector: Client = EventStoreDBClient.connectionString(
      configuration.source.connectionString,
    );
    return {
      module: ReaderModule,
      imports: [await DriverModule.get(configuration)],
      providers: [
        Logger,
        EventStoreService,
        {
          provide: VALIDATOR,
          useClass: NextEventsValidatorService,
        },
        {
          provide: SUBSCRIPTIONS,
          useValue: configuration.eventStoreSubsystems.subscriptions.persistent,
        },
        {
          provide: ALLOWED_EVENTS,
          useValue: allowedEvents ?? {},
        },
        {
          provide: READER,
          useClass: GrpcReaderService,
        },
        {
          provide: VALIDATOR,
          useClass: NextEventsValidatorService,
        },
        {
          provide: EVENT_STORE_CONNECTOR,
          useValue: eventStoreConnector,
        },
      ],
    };
  }
}
