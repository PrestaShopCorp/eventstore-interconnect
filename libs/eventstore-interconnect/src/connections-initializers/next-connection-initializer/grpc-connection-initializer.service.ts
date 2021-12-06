import { Inject, Injectable, Logger } from "@nestjs/common";
import { Client } from "@eventstore/db-client/dist/Client";
import { CONNECTION_CONFIGURATION, EVENTSTORE_DB_CLIENT } from "../../constants";
import { ConnectionConfiguration } from "../../interconnection-configuration";
import { ConnectionGuard, EVENTSTORE_CONNECTION_GUARD } from "../../connections-guards";
import { GrpcConnectionInitializer } from "./grpc-connection-initializer";

@Injectable()
export class GrpcConnectionInitializerService
  implements GrpcConnectionInitializer
{
  private client: Client;

  constructor(
    @Inject(CONNECTION_CONFIGURATION)
    private readonly connectionConfiguration: ConnectionConfiguration,
    @Inject(EVENTSTORE_CONNECTION_GUARD)
    private readonly connectionGuard: ConnectionGuard,
    @Inject(EVENTSTORE_DB_CLIENT)
    private readonly eventStoreDBClient: any,
    private readonly logger: Logger,
  ) {}

  public async init(): Promise<void> {
    this.client = this.eventStoreDBClient.connectionString(
      this.connectionConfiguration.connectionString,
    );
    this.logger.log(
      `Starting to ping connection on ${this.connectionConfiguration.connectionString}...`,
    );
    await this.connectionGuard.startConnectionLinkPinger(
      this.client,
      this.connectionConfiguration,
    );
  }

  public getConnectedClient(): Client {
    return this.client;
  }
}
