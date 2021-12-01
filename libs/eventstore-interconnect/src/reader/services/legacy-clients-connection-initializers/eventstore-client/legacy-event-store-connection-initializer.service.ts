import { Inject, Injectable } from '@nestjs/common';
import {
  ConnectionSettings,
  createConnection,
  EventStoreNodeConnection,
} from 'node-eventstore-client';
import { nanoid } from 'nanoid';
import { InterconnectionConfiguration } from '../../../../interconnection-configuration';
import {
  INTERCONNECT_CONFIGURATION,
  INTERCONNECTION_CONNECTION_DEFAULT_NAME,
} from '../../../../constants';
import { Logger } from 'nestjs-pino-stackdriver';
import { LegacyEventstoreClientsConnectionInitializer } from './legacy-eventstore-clients-connection-initializer';
import {
  ConnectionGuard,
  EVENTSTORE_CONNECTION_GUARD,
} from '../../../../connections-guards';

@Injectable()
export class LegacyEventStoreConnectionInitializerService
  implements LegacyEventstoreClientsConnectionInitializer
{
  private eventStoreNodeConnection: EventStoreNodeConnection;

  constructor(
    @Inject(INTERCONNECT_CONFIGURATION)
    private readonly configuration: InterconnectionConfiguration,
    @Inject(EVENTSTORE_CONNECTION_GUARD)
    private readonly connectionGuard: ConnectionGuard,
    private readonly logger: Logger,
  ) {}

  public async initClient(): Promise<void> {
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
      host: this.configuration.source.tcp.host,
      port: this.configuration.source.tcp.port,
    };

    this.eventStoreNodeConnection = createConnection(
      esConnectionConf,
      tcpEndPoint,
      this.configuration.source.tcpConnectionName ??
        `${INTERCONNECTION_CONNECTION_DEFAULT_NAME}-${nanoid(11)}`,
    );

    await this.eventStoreNodeConnection.connect();

    await this.connectionGuard.checkTcpConnection(
      this.eventStoreNodeConnection,
      this.configuration.source,
    );

    this.logger.log(
      'READER : EventstoreClient created (at ' +
        tcpEndPoint.host +
        ':' +
        tcpEndPoint.port +
        ')',
    );
  }

  public getEventstoreConnectedClient(): EventStoreNodeConnection {
    return this.eventStoreNodeConnection;
  }
}
