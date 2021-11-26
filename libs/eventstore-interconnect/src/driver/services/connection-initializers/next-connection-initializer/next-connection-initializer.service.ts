import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Client } from '@eventstore/db-client/dist/Client';
import { EventStoreDBClient } from '@eventstore/db-client';
import { NoGrpcConnectionError } from '../../../errors/no-grpc-connection.error';
import { INTERCONNECT_CONFIGURATION } from '../../../../constants';
import { InterconnectionConfiguration } from '../../../../interconnection-configuration';
import { Logger } from 'nestjs-pino-stackdriver';
import { ConnectionInitializer } from '../connection-initializer';

@Injectable()
export class NextConnectionInitializerService
  implements OnModuleInit, ConnectionInitializer
{
  private client: Client;

  constructor(
    @Inject(INTERCONNECT_CONFIGURATION)
    private readonly interconnectionConfiguration: InterconnectionConfiguration,
    private readonly logger: Logger,
  ) {}

  public async onModuleInit(): Promise<any> {
    this.client = EventStoreDBClient.connectionString(
      this.interconnectionConfiguration.destination.connectionString,
    );
    await this.checkNextConnectionStatus(
      this.client,
      this.interconnectionConfiguration.destination.connectionString,
    );
    this.logger.log(
      'DRIVER : Connected to Next eventstore on ' +
        this.interconnectionConfiguration.destination.connectionString,
    );
  }

  public getConnectedClient(): Client {
    return this.client;
  }

  public async checkNextConnectionStatus(
    eventStoreConnector: Client,
    connectionString: string,
  ): Promise<void> {
    try {
      await eventStoreConnector.getStreamMetadata('$all');
    } catch (errMessage) {
      throw new NoGrpcConnectionError(errMessage, connectionString);
    }
  }
}
