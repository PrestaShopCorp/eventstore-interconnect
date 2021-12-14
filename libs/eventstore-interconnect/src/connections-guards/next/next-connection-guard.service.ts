import { Injectable, Logger } from '@nestjs/common';
import { ConnectionGuard } from '../connection-guard';
import { Client } from '@eventstore/db-client/dist/Client';
import { EVENT_WRITER_TIMEOUT_IN_MS } from '../../constants';
import { CONNECTION_LINK_CHECK_INTERVAL_IN_MS } from '../connection-guard.constants';
import { ConnectionConfiguration } from '../../model';

@Injectable()
export class NextConnectionGuardService implements ConnectionGuard {
  private readonly logger = new Logger(NextConnectionGuardService.name);

  public async startConnectionLinkPinger(
    connection: Client,
    connectionConfiguration: ConnectionConfiguration,
  ): Promise<void> {
    this.loadNextPing(connection, connectionConfiguration);

    const timer = setTimeout(() => {
      this.logger.error(
        `Connection broken on ${connectionConfiguration.connectionString}`,
      );
      process.exit(1);
    }, EVENT_WRITER_TIMEOUT_IN_MS);

    await connection.getStreamMetadata('$all');
    clearTimeout(timer);
  }

  private loadNextPing(
    connection: Client,
    connectionConfiguration: ConnectionConfiguration,
  ) {
    setTimeout(() => {
      this.startConnectionLinkPinger(connection, connectionConfiguration);
    }, CONNECTION_LINK_CHECK_INTERVAL_IN_MS);
  }
}
