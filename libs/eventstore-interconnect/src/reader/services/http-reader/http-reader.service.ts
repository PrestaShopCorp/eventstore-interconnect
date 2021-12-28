import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Reader } from '../reader';
import { SUBSCRIPTIONS } from '../constants';
import {
  HTTPClient,
  PersistentSubscriptionOptions,
} from 'geteventstore-promise';
import {
  EventStoreNodeConnection,
  ResolvedEvent,
} from 'node-eventstore-client';
import { CONNECTION_CONFIGURATION, LOGGER } from '../../../constants';
import { EVENT_HANDLER, EventHandler } from '../../../event-handler';
import {
  HTTP_CLIENT_CONNECTION_INITIALIZER,
  HttpClientsConnectionInitializer,
  TCP_EVENTSTORE_CLIENT_CONNECTION_INITIALIZER,
  TCPEventstoreClientsConnectionInitializer,
} from '../../../connections-initializers';
import {
  ConnectionConfiguration,
  IEventStorePersistentSubscriptionConfig,
} from '../../../model';

@Injectable()
export class HttpReaderService implements Reader, OnModuleInit {
  constructor(
    @Inject(CONNECTION_CONFIGURATION)
    private readonly configuration: ConnectionConfiguration,
    @Inject(SUBSCRIPTIONS)
    private readonly subscriptions: IEventStorePersistentSubscriptionConfig[],
    @Inject(EVENT_HANDLER)
    private readonly eventHandler: EventHandler,
    @Inject(HTTP_CLIENT_CONNECTION_INITIALIZER)
    private readonly httpClientProvider: HttpClientsConnectionInitializer,
    @Inject(TCP_EVENTSTORE_CLIENT_CONNECTION_INITIALIZER)
    private readonly esClientInitializer: TCPEventstoreClientsConnectionInitializer,
    @Inject(LOGGER) private readonly logger: Logger,
  ) {}

  public async onModuleInit(): Promise<void> {
    await this.httpClientProvider.init();
    await this.esClientInitializer.init();

    await this.upsertPersistantSubscriptions();
    this.logger.log(
      `READER : connected to ${this.configuration.tcp.host}:${this.configuration.tcp.port}`,
    );
  }

  public async upsertPersistantSubscriptions(): Promise<void> {
    const tcpClient: EventStoreNodeConnection =
      this.esClientInitializer.getConnectedClient() as EventStoreNodeConnection;
    const httpClient: HTTPClient = this.httpClientProvider.getHttpClient();

    for (const subscription of this.subscriptions) {
      const options: PersistentSubscriptionOptions = {
        ...subscription.options,
        ...{
          resolveLinkTos:
            subscription.options.resolveLinkTos ||
            subscription.options.resolveLinktos,
        },
      };
      await httpClient.persistentSubscriptions.assert(
        subscription.group,
        subscription.stream,
        options,
      );

      await this.connectToPersistentSubscription(tcpClient, subscription);
    }
  }

  private async connectToPersistentSubscription(
    esClient: EventStoreNodeConnection,
    subscription: IEventStorePersistentSubscriptionConfig,
  ): Promise<void> {
    this.logger.log(
      `Connecting to persistent subscription "${subscription.group}" on stream ${subscription.stream}...`,
    );
    await esClient.connectToPersistentSubscription(
      subscription.stream,
      subscription.group,
      async (subscription, event: ResolvedEvent) => {
        await this.eventHandler.handle(event).catch((e) => {
          subscription.fail(event, 3, 'An error occurred');
          this.logger.error(
            `Unexpected error while handling an event (${JSON.stringify(
              event,
            )})... Details : ${e.message}`,
          );
        });
        subscription.acknowledge(event);
      },
      subscription.onSubscriptionDropped as any,
      this.configuration.credentials,
      subscription.bufferSize,
      subscription.autoAck,
    );
    this.logger.log(
      `Connected to "${subscription.group}" on stream ${subscription.stream}.`,
    );
  }
}
