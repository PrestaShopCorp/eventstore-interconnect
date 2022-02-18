import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConnectionGuard } from '../connection-guard';
import { Client } from '@eventstore/db-client/dist/Client';
import { EVENT_WRITER_TIMEOUT_IN_MS } from '../../constants';
import { CONNECTION_LINK_CHECK_INTERVAL_IN_MS } from '../connection-guard.constants';
import { ConnectionConfiguration } from '../../model';
import { LOGGER } from '../../logger';

@Injectable()
export class NextConnectionGuardService implements ConnectionGuard {
  constructor(@Inject(LOGGER) private readonly logger: Logger) {}

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

    this.logger.debug(
      `Checking connection on ${connectionConfiguration.connectionString}...`,
    );
    await connection.getStreamMetadata('$all');
    clearTimeout(timer);
    this.logger.debug(
      `Connection on ${connectionConfiguration.connectionString} is OK`,
    );
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
