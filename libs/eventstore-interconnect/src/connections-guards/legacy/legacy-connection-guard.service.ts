import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventStoreNodeConnection } from 'node-eventstore-client';
import { EVENT_WRITER_TIMEOUT_IN_MS, LOGGER } from '../../constants';
import { ConnectionConfiguration } from '../../model';
import { ConnectionGuard } from '../connection-guard';
import { CONNECTION_LINK_CHECK_INTERVAL_IN_MS } from '../connection-guard.constants';

@Injectable()
export class LegacyConnectionGuardService implements ConnectionGuard {
  constructor(@Inject(LOGGER) private readonly logger: Logger) {}

  public async startConnectionLinkPinger(
    connection: EventStoreNodeConnection,
    connectionConfiguration: ConnectionConfiguration,
  ): Promise<void> {
    setTimeout(() => {
      this.startConnectionLinkPinger(connection, connectionConfiguration);
    }, CONNECTION_LINK_CHECK_INTERVAL_IN_MS);

    const tcpEndPoint = connectionConfiguration.tcp;

    const timeout: NodeJS.Timeout = setTimeout(() => {
      this.logger.error(
        `Connection to ${tcpEndPoint.host} on port ${tcpEndPoint.port} failed by timeout.`,
      );
      process.exit(1);
    }, EVENT_WRITER_TIMEOUT_IN_MS);

    await this.getMetadatasFromMainStream(connection, connectionConfiguration);
    clearTimeout(timeout);
  }

  private async getMetadatasFromMainStream(
    connection: EventStoreNodeConnection,
    connectionConfiguration: ConnectionConfiguration,
  ): Promise<void> {
    this.logger.debug(
      `Checking connection to ${connectionConfiguration.tcp.host} on port ${connectionConfiguration.tcp.port}...`,
    );

    await connection.getStreamMetadataRaw(
      '$all',
      connectionConfiguration.credentials,
    );

    this.logger.debug(
      `Connection on ${connectionConfiguration.tcp.host}:${connectionConfiguration.tcp.port} is OK`,
    );
  }
}
