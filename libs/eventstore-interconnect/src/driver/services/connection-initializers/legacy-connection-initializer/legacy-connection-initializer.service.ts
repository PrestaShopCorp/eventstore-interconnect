import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  ConnectionSettings,
  createConnection,
  EventStoreNodeConnection,
} from 'node-eventstore-client';
import * as geteventstorePromise from 'geteventstore-promise';
import { HTTPClient } from 'geteventstore-promise';
import {
  INTERCONNECT_CONFIGURATION,
  INTERCONNECTION_CONNECTION_DEFAULT_NAME,
} from '../../../../constants';
import { nanoid } from 'nanoid';
import {
  InterconnectionConfiguration,
  ProtocolConf,
} from '../../../../interconnection-configuration';
import { Logger } from 'nestjs-pino-stackdriver';
import { NoLegacyConnectionError } from '../../../../reader/errors/no-legacy-connection.error';
import { ConnectionInitializer } from '../connection-initializer';
import {
  ConnectionGuard,
  EVENTSTORE_CONNECTION_GUARD,
} from '../../../../connections-guards';

@Injectable()
export class LegacyConnectionInitializerService
  implements OnModuleInit, ConnectionInitializer
{
  private eventStoreNodeConnection: EventStoreNodeConnection;

  constructor(
    @Inject(INTERCONNECT_CONFIGURATION)
    private readonly configuration: InterconnectionConfiguration,
    @Inject(EVENTSTORE_CONNECTION_GUARD)
    private readonly connectionGuard: ConnectionGuard,
    private readonly logger: Logger,
  ) {}

  public async onModuleInit() {
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
      host: this.configuration.destination.tcp.host,
      port: this.configuration.destination.tcp.port,
    };

    const httpClient: HTTPClient = new geteventstorePromise.HTTPClient({
      hostname: this.configuration.destination.http.host.replace(
        /^https?:\/\//,
        '',
      ),
      port: this.configuration.destination.http.port,
      credentials: {
        username: this.configuration.destination.credentials.username,
        password: this.configuration.destination.credentials.password,
      },
    });

    this.eventStoreNodeConnection = createConnection(
      esConnectionConf,
      tcpEndPoint,
      this.configuration.destination.tcpConnectionName ??
        `${INTERCONNECTION_CONNECTION_DEFAULT_NAME}-${nanoid(11)}`,
    );
    await this.eventStoreNodeConnection.connect();

    this.logger.log(
      `Starting to ping connection on ${tcpEndPoint.host}:${tcpEndPoint.port}...`,
    );
    await this.connectionGuard.startConnectionLinkPinger(
      this.eventStoreNodeConnection,
      this.configuration.destination,
    );

    this.logger.log(
      'DRIVER : Connected to legacy eventstore at ' +
        tcpEndPoint.host +
        ':' +
        tcpEndPoint.port,
    );

    await this.checkHttpConnectionStatus(httpClient, tcpEndPoint);
  }

  public async checkHttpConnectionStatus(
    httpClient: HTTPClient,
    tcpEndPoint: ProtocolConf,
  ): Promise<void> {
    try {
      await httpClient.checkStreamExists('$all');
    } catch (errMessage) {
      throw new NoLegacyConnectionError(errMessage, tcpEndPoint);
    }
  }

  public getConnectedClient(): EventStoreNodeConnection {
    return this.eventStoreNodeConnection;
  }
}
