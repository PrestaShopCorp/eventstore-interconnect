import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Reader } from '../reader';
import {
  ConnectionConfiguration,
  InterconnectionConfiguration,
} from '../../../interconnection-configuration';
import { Logger } from 'nestjs-pino-stackdriver';
import { SUBSCRIPTIONS } from '../constants';
import { PersistentSubscriptionOptions } from 'geteventstore-promise';
import {
  EventStoreNodeConnection,
  ResolvedEvent,
} from 'node-eventstore-client';
import { IEventStorePersistentSubscriptionConfig } from 'nestjs-geteventstore-legacy/dist/interfaces/subscription.interface';
import {
  CONNECTION_CONFIGURATION,
  INTERCONNECT_CONFIGURATION,
} from '../../../constants';
import { EVENT_HANDLER, EventHandler } from '../../../event-handler';
import {
  HTTP_CLIENT_CONNECTION_INITIALIZER,
  HttpClientsConnectionInitializer,
  TCP_EVENTSTORE_CLIENT_CONNECTION_INITIALIZER,
  TCPEventstoreClientsConnectionInitializer,
} from '../../../connections-initializers';

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
    private readonly logger: Logger,
  ) {}

  public async onModuleInit(): Promise<void> {
    // await this.httpClientProvider.init();
    await this.esClientInitializer.init();

    await this.upsertPersistantSubscriptions();
  }

  public async upsertPersistantSubscriptions(): Promise<void> {
    const esClient: EventStoreNodeConnection =
      this.esClientInitializer.getConnectedClient() as EventStoreNodeConnection;

    for (const subscription of this.subscriptions) {
      await this.upsertPersistantSubscription(subscription, esClient);
    }
  }

  private async upsertPersistantSubscription(
    subscription: IEventStorePersistentSubscriptionConfig,
    esClient: EventStoreNodeConnection,
  ): Promise<void> {
    const options: PersistentSubscriptionOptions = {
      ...subscription.options,
      ...{
        resolveLinkTos:
          subscription.options.resolveLinkTos ||
          subscription.options.resolveLinktos,
      },
    };

    try {
      await esClient.updatePersistentSubscription(
        subscription.stream,
        subscription.group,
        options,
        this.configuration.credentials,
      );
    } catch (e) {
      this.logger.log(
        `Persistent subscription "${subscription.group}" on stream ${subscription.stream} does not exist, trying to create it...`,
      );

      await esClient.createPersistentSubscription(
        subscription.stream,
        subscription.group,
        options,
        this.configuration.credentials,
      );
      this.logger.log(
        `Persistent subscription "${subscription.group}" on stream ${subscription.stream} created.`,
      );
    }
    await this.connectToPersistentSubscription(esClient, subscription);
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
        console.log('ldld');
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
      this.configuration.credentials,
      subscription.bufferSize,
      subscription.autoAck,
    );
    this.logger.log(`Connected.`);
  }
}
