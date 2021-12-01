import { Injectable } from '@nestjs/common';
import { EventStoreNodeConnection } from 'node-eventstore-client';
import { EVENT_WRITER_TIMEOUT_IN_MS } from '../../constants';
import { ConnectionConfiguration } from '../../interconnection-configuration';
import { Logger } from 'nestjs-pino-stackdriver';
import { ConnectionGuard } from '../connection-guard';

@Injectable()
export class LegacyConnectionGuardService implements ConnectionGuard {
  constructor(private readonly logger: Logger) {}

  public async checkTcpConnection(
    connection: EventStoreNodeConnection,
    connectionConfiguration: ConnectionConfiguration,
  ): Promise<void> {
    const tcpEndPoint = connectionConfiguration.tcp;

    this.logger.log(
      `Checking connection to ${tcpEndPoint.host} on port ${tcpEndPoint.port}...`,
    );

    const timeout: NodeJS.Timeout = setTimeout(() => {
      this.logger.error(
        `Connection to ${tcpEndPoint.host} on port ${tcpEndPoint.port} failed by timeout.`,
      );
      process.exit(1);
    }, EVENT_WRITER_TIMEOUT_IN_MS);

    await LegacyConnectionGuardService.getMetadatasFromMainStream(
      connection,
      connectionConfiguration,
    ).then(() => {
      clearTimeout(timeout);
    });
  }

  private static async getMetadatasFromMainStream(
    connection: EventStoreNodeConnection,
    connectionConfiguration: ConnectionConfiguration,
  ): Promise<void> {
    await connection.getStreamMetadataRaw(
      '$all',
      connectionConfiguration.credentials,
    );
  }
}
