import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  ConnectionSettings,
  createConnection,
  EventStoreNodeConnection,
} from 'node-eventstore-client';
import { nanoid } from 'nanoid';
import { ConnectionConfiguration } from '../../../model';
import {
  CONNECTION_CONFIGURATION,
  INTERCONNECTION_CONNECTION_DEFAULT_NAME,
  LOGGER,
} from '../../../constants';
import {
  ConnectionGuard,
  EVENTSTORE_CONNECTION_GUARD,
} from '../../../connections-guards';
import { TCPEventstoreClientsConnectionInitializer } from './tcp-eventstore-clients-connection-initializer';

@Injectable()
export class TCPEventStoreConnectionInitializerService
  implements TCPEventstoreClientsConnectionInitializer
{
  private eventStoreNodeConnection: EventStoreNodeConnection;

  constructor(
    @Inject(CONNECTION_CONFIGURATION)
    private readonly configuration: ConnectionConfiguration,
    @Inject(EVENTSTORE_CONNECTION_GUARD)
    private readonly connectionGuard: ConnectionGuard,
    @Inject(LOGGER) private readonly logger: Logger,
  ) {}

  public async init(): Promise<void> {
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
      host: this.configuration.tcp.host,
      port: this.configuration.tcp.port,
    };

    this.eventStoreNodeConnection = createConnection(
      esConnectionConf,
      tcpEndPoint,
      this.configuration.tcpConnectionName ??
        `${INTERCONNECTION_CONNECTION_DEFAULT_NAME}-${nanoid(11)}`,
    );

    await this.eventStoreNodeConnection.connect();

    this.logger.log(
      `Starting to ping connection on ${tcpEndPoint.host}:${tcpEndPoint.port}...`,
    );
    await this.connectionGuard.startConnectionLinkPinger(
      this.eventStoreNodeConnection,
      this.configuration,
    );
  }

  public getConnectedClient(): EventStoreNodeConnection {
    return this.eventStoreNodeConnection;
  }
}
