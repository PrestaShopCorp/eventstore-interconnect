import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Reader } from '../reader';
import { InterconnectionConfiguration } from '../../../interconnection-configuration';
import { Logger } from 'nestjs-pino-stackdriver';
import { SUBSCRIPTIONS } from '../constants';
import {
  HTTPClient,
  PersistentSubscriptionOptions,
} from 'geteventstore-promise';
import {
  EventStoreNodeConnection,
  ResolvedEvent,
} from 'node-eventstore-client';
import { IEventStorePersistentSubscriptionConfig } from 'nestjs-geteventstore-legacy/dist/interfaces/subscription.interface';
import { INTERCONNECT_CONFIGURATION } from '../../../constants';
import { EVENT_HANDLER, EventHandler } from '../../../event-handler';
import {
  LEGACY_EVENTSTORE_CLIENT_CONNECTION_INITIALIZER,
  LegacyEventstoreClientsConnectionInitializer,
} from '../legacy-clients-connection-initializers/eventstore-client/legacy-eventstore-clients-connection-initializer';
import {
  LEGACY_HTTP_CLIENT_CONNECTION_INITIALIZER,
  LegacyHttpClientsConnectionInitializer,
} from '../legacy-clients-connection-initializers/http-client/legacy-http-clients-connection-initializer';

@Injectable()
export class HttpReaderService implements Reader, OnModuleInit {
  constructor(
    @Inject(INTERCONNECT_CONFIGURATION)
    private readonly configuration: InterconnectionConfiguration,
    @Inject(SUBSCRIPTIONS)
    private readonly subscriptions: IEventStorePersistentSubscriptionConfig[],
    @Inject(EVENT_HANDLER)
    private readonly eventHandler: EventHandler,
    @Inject(LEGACY_HTTP_CLIENT_CONNECTION_INITIALIZER)
    private readonly httpClientProvider: LegacyHttpClientsConnectionInitializer,
    @Inject(LEGACY_EVENTSTORE_CLIENT_CONNECTION_INITIALIZER)
    private readonly esClientInitializer: LegacyEventstoreClientsConnectionInitializer,
    private readonly logger: Logger,
  ) {}

  public async onModuleInit(): Promise<void> {
    await this.httpClientProvider.initClient();
    await this.esClientInitializer.initClient();

    await this.upsertPersistantSubscription();
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
      const httpClient: HTTPClient = this.httpClientProvider.getHttpClient();
      await httpClient.persistentSubscriptions.assert(
        subscription.group,
        subscription.stream,
        options,
      );
    }
    await this.connectToPersistentSubscriptions();
  }

  private async connectToPersistentSubscriptions(): Promise<void> {
    const esClient: EventStoreNodeConnection =
      this.esClientInitializer.getEventstoreConnectedClient() as EventStoreNodeConnection;

    for (const subscription of this.subscriptions) {
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
              `Unexpected error while handling an event... Details : ${e.message}`,
            );
          });
          subscription.acknowledge(event);
        },
        (sub, reason, error) => {
          subscription.onSubscriptionDropped(sub, reason, error.message);
        },
        this.configuration.source.credentials,
        subscription.bufferSize,
        subscription.autoAck,
      );
      this.logger.log(`Connected.`);
    }
  }
}
