import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConnectionGuard } from '../connection-guard';
import { Client } from '@eventstore/db-client/dist/Client';
import { EVENT_WRITER_TIMEOUT_IN_MS } from '../../constants';
import { CONNECTION_LINK_CHECK_INTERVAL_IN_MS } from '../connection-guard.constants';
import { ConnectionConfiguration } from '../../model';
import { LOGGER } from '../../logger';
import {UnavailableError} from "@eventstore/db-client";

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

    await this.testConnection(connection, connectionConfiguration);

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

  private async testConnection(
      connection: Client,
      connectionConfiguration: ConnectionConfiguration,
      tryCount = 0
  ): Promise<void> {
    try {
      this.logger.debug(
          `Checking connection on ${connectionConfiguration.connectionString}...`,
      );
      await connection.listAllPersistentSubscriptions();
    } catch (error) {
      if (error instanceof UnavailableError && tryCount < 10) {
        this.logger.log(`EventStore is unavailable. Try ${tryCount} Retrying in 500 ms...`);
        await new Promise((resolve) => setTimeout(resolve, 500));
        return this.testConnection(connection, connectionConfiguration,tryCount + 1);
      } else {
        this.logger.error(error);
        throw error;
      }
    }
  }
}

