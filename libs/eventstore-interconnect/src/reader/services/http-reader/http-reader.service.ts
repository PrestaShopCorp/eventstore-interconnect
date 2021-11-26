import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Reader } from '../reader';
import {
  Credentials,
  InterconnectionConfiguration,
  ProtocolConf,
} from '../../../interconnection-configuration';
import { Logger } from 'nestjs-pino-stackdriver';
import { SUBSCRIPTIONS } from '../constants';
import * as geteventstorePromise from 'geteventstore-promise';
import {
  HTTPClient,
  PersistentSubscriptionOptions,
} from 'geteventstore-promise';
import {
  ConnectionSettings,
  createConnection,
  EventStoreNodeConnection,
  ResolvedEvent,
} from 'node-eventstore-client';
import { IEventStorePersistentSubscriptionConfig } from 'nestjs-geteventstore-legacy/dist/interfaces/subscription.interface';
import {
  CREDENTIALS,
  INTERCONNECT_CONFIGURATION,
  INTERCONNECTION_CONNECTION_DEFAULT_NAME,
} from '../../../constants';
import { EVENT_HANDLER, EventHandler } from '../../../event-handler';
import { NoLegacyConnectionError } from '../../errors/no-legacy-connection.error';
import { nanoid } from 'nanoid';

@Injectable()
export class HttpReaderService implements Reader, OnModuleInit {
  private client: HTTPClient;
  private eventStoreConnection: EventStoreNodeConnection;

  constructor(
    @Inject(INTERCONNECT_CONFIGURATION)
    private readonly configuration: InterconnectionConfiguration,
    @Inject(SUBSCRIPTIONS)
    private readonly subscriptions: IEventStorePersistentSubscriptionConfig[],
    @Inject(CREDENTIALS)
    private readonly credentials: Credentials,
    @Inject(EVENT_HANDLER)
    private readonly eventHandler: EventHandler,
    private readonly logger: Logger,
  ) {}

  public async onModuleInit(): Promise<void> {
    const tcpEndPoint: ProtocolConf = {
      host: this.configuration.source.tcp.host,
      port: this.configuration.source.tcp.port,
    };
    await this.connectToClient(tcpEndPoint);
    await this.getEventstoreConnection(tcpEndPoint);

    await this.upsertPersistantSubscription();
  }

  private async getEventstoreConnection(tcpEndPoint: ProtocolConf) {
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

    this.logger.log(
      'configuration.source.tcpConnectionName : ' +
        this.configuration.source.tcpConnectionName ??
        `${INTERCONNECTION_CONNECTION_DEFAULT_NAME}-${nanoid(11)}`,
    );
    this.eventStoreConnection = createConnection(
      esConnectionConf,
      tcpEndPoint,
      this.configuration.source.tcpConnectionName ??
        `${INTERCONNECTION_CONNECTION_DEFAULT_NAME}-${nanoid(11)}`,
    );
    await this.eventStoreConnection.connect();

    this.logger.log(
      'READER : Connected to legacy eventstore at ' +
        tcpEndPoint.host +
        ':' +
        tcpEndPoint.port,
    );
  }

  private async connectToClient(tcpEndPoint: ProtocolConf) {
    this.client = new geteventstorePromise.HTTPClient({
      hostname: this.configuration.source.http.host.replace(/^https?:\/\//, ''),
      port: this.configuration.source.http.port,
      credentials: {
        username: this.configuration.source.credentials.username,
        password: this.configuration.source.credentials.password,
      },
    });
    await this.checkLegacyConnectionStatus(this.client, tcpEndPoint);
  }

  public async upsertPersistantSubscription(): Promise<void> {
    for (const subscription of this.subscriptions) {
      const options: PersistentSubscriptionOptions = {
        ...subscription.options,
        ...{
          resolveLinkTos:
            subscription.options.resolveLinkTos ||
            subscription.options.resolveLinktos,
        },
      };
      await this.client.persistentSubscriptions.assert(
        subscription.group,
        subscription.stream,
        options,
      );
    }
    for (const subscription of this.subscriptions) {
      this.logger.log(
        `Connecting to persistent subscription "${subscription.group}" on stream ${subscription.stream}...`,
      );
      await this.eventStoreConnection.connectToPersistentSubscription(
        subscription.stream,
        subscription.group,
        async (subscription, event: ResolvedEvent) => {
          await this.eventHandler.handle(event).catch((e) => {
            subscription.fail(event, 3, 'An error occurred');
            this.logger.error(
              `Unexpected error while handling an event... Details : ${e.message}`,
            );
          });
          subscription.acknowledge(event);
        },
        (sub, reason, error) => {
          subscription.onSubscriptionDropped(sub, reason, error.message);
        },
        this.credentials,
        subscription.bufferSize,
        subscription.autoAck,
      );
      this.logger.log(`Connected.`);
    }
  }

  public async checkLegacyConnectionStatus(
    httpClient: HTTPClient,
    tcpEndPoint: ProtocolConf,
  ): Promise<void> {
    try {
      await httpClient.checkStreamExists('$all');
    } catch (errMessage) {
      throw new NoLegacyConnectionError(errMessage, tcpEndPoint);
    }
  }
}
