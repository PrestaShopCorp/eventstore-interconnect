import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Client } from '@eventstore/db-client/dist/Client';
import {
  EVENTSTORE_DB_CLIENT,
  INTERCONNECT_CONFIGURATION,
} from '../../../../constants';
import { InterconnectionConfiguration } from '../../../../interconnection-configuration';
import { Logger } from 'nestjs-pino-stackdriver';
import { ConnectionInitializer } from '../connection-initializer';
import {
  ConnectionGuard,
  EVENTSTORE_CONNECTION_GUARD,
} from '../../../../connections-guards';

@Injectable()
export class NextConnectionInitializerService
  implements OnModuleInit, ConnectionInitializer
{
  private client: Client;

  constructor(
    @Inject(INTERCONNECT_CONFIGURATION)
    private readonly interconnectionConfiguration: InterconnectionConfiguration,
    @Inject(EVENTSTORE_CONNECTION_GUARD)
    private readonly connectionGuard: ConnectionGuard,
    @Inject(EVENTSTORE_DB_CLIENT)
    private readonly eventStoreDBClient: any,
    private readonly logger: Logger,
  ) {}

  public async onModuleInit(): Promise<any> {
    this.client = this.eventStoreDBClient.connectionString(
      this.interconnectionConfiguration.destination.connectionString,
    );
    await this.connectionGuard.startConnectionLinkPinger(
      this.client,
      this.interconnectionConfiguration.destination,
    );
    this.logger.log(
      'DRIVER : Connected to Next eventstore on ' +
        this.interconnectionConfiguration.destination.connectionString,
    );
  }

  public getConnectedClient(): Client {
    return this.client;
  }
}
