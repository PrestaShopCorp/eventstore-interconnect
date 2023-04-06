import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  EventType,
  PersistentSubscriptionToStream,
  persistentSubscriptionToStreamSettingsFromDefaults,
  ResolvedEvent,
} from '@eventstore/db-client';
import { isNil } from '@nestjs/common/utils/shared.utils';
import { Client } from '@eventstore/db-client/dist/Client';
import {
  PERSISTENT_SUBSCRIPTION_ALREADY_EXIST_ERROR_CODE,
  SUBSCRIPTIONS,
} from '../constants';
import {
  CONNECTION_CONFIGURATION,
  EVENTSTORE_DB_CLIENT,
} from '../../../constants';
import {
  ConnectionConfiguration,
  ConnectionGuard,
  EVENT_HANDLER,
  EventHandler,
  EVENTSTORE_CONNECTION_GUARD,
  GRPC_CONNECTION_INITIALIZER,
  GrpcConnectionInitializer,
  IPersistentSubscriptionConfig,
  Reader,
} from '../../../';
import { LOGGER } from '../../../logger';

@Injectable()
export class GrpcReaderService implements Reader, OnModuleInit {
  private client: Client;

  constructor(
    @Inject(CONNECTION_CONFIGURATION)
    private readonly connectionConfiguration: ConnectionConfiguration,
    @Inject(EVENT_HANDLER)
    private readonly eventHandler: EventHandler,
    @Inject(SUBSCRIPTIONS)
    private readonly subscriptions: IPersistentSubscriptionConfig[],
    @Inject(EVENTSTORE_DB_CLIENT)
    private readonly eventStoreDBClient: any,
    @Inject(GRPC_CONNECTION_INITIALIZER)
    private readonly grpcConnectionInitializer: GrpcConnectionInitializer,
    @Inject(EVENTSTORE_CONNECTION_GUARD)
    private readonly connectionGuard: ConnectionGuard,
    @Inject(LOGGER) private readonly logger: Logger,
  ) {}

  public async onModuleInit(): Promise<any> {
    await this.grpcConnectionInitializer.init();
    await this.startEventstoreClient();
    await this.upsertPersistantSubscriptions();
    this.logger.log(
      'READER : connected to ' + this.connectionConfiguration.connectionString,
    );
  }

  private async startEventstoreClient(): Promise<void> {
    this.client = this.grpcConnectionInitializer.getConnectedClient();
    await this.connectionGuard.startConnectionLinkPinger(
      this.client,
      this.connectionConfiguration,
    );
  }

  public async upsertPersistantSubscriptions(): Promise<void> {
    await this.init(async (event: any) => {
      try {
        await this.eventHandler.handle(event);
      } catch (e) {
        this.logger.error(
          `Unexpected error while handling an event... Details : ${e.message}`,
        );
      }
    });
  }

  public async init(onEvent: (event: any) => void): Promise<void> {
    await this.subscribeToPersistentSubscriptions(this.subscriptions, onEvent);

    this.logger.log(`EventStore v21 connected`);
  }

  public async subscribeToPersistentSubscriptions(
    subscriptions: IPersistentSubscriptionConfig[] = [],
    onEvent: (event: any) => void,
  ): Promise<PersistentSubscriptionToStream[]> {
    await this.upsertPersistentSubscriptions(subscriptions);

    return Promise.all(
      subscriptions.map(
        (
          subscription: IPersistentSubscriptionConfig,
        ): PersistentSubscriptionToStream => {
          this.logger.log(
            `Connecting to persistent subscription "${subscription.group}" on stream "${subscription.stream}"...`,
          );
          const persistentSubscription: PersistentSubscriptionToStream =
            this.client.subscribeToPersistentSubscriptionToStream(
              subscription.stream,
              subscription.group,
            );
          persistentSubscription.on(
            'data',
            (event: ResolvedEvent<EventType>) => {
              try {
                onEvent(event);
                persistentSubscription.ack(event);
              } catch (e) {
                persistentSubscription.nack(
                  'park',
                  'An error occured...',
                  event,
                );
                throw e;
              }
            },
          );
          if (!isNil(subscription.onSubscriptionStart)) {
            persistentSubscription.on(
              'confirmation',
              subscription.onSubscriptionStart,
            );
          }
          if (!isNil(subscription.onSubscriptionDropped)) {
            persistentSubscription.on(
              'close',
              subscription.onSubscriptionDropped,
            );
          }

          persistentSubscription.on('error', subscription.onError);

          persistentSubscription.on('error', async (): Promise<void> => {});
          this.logger.log(
            `Connected to "${subscription.group}" on stream ${subscription.stream}.`,
          );
          return persistentSubscription;
        },
      ),
    );
  }

  private async upsertPersistentSubscriptions(
    subscriptions: IPersistentSubscriptionConfig[],
  ): Promise<void> {
    for (const subscription of subscriptions) {
      await this.upsertPersistentSubscription(subscription);
    }
  }

  private async upsertPersistentSubscription(
    subscription: IPersistentSubscriptionConfig,
  ): Promise<void> {
    try {
      await this.client.createPersistentSubscriptionToStream(
        subscription.stream,
        subscription.group,
        {
          ...persistentSubscriptionToStreamSettingsFromDefaults(),
          ...subscription.settingsForCreation?.subscriptionSettings,
          liveBufferSize: 1,
        },
        subscription.settingsForCreation?.baseOptions,
      );
      this.logger.log(
        `Persistent subscription "${subscription.group}" on stream ${subscription.stream} created.`,
      );
    } catch (e) {
      if (GrpcReaderService.isNotAlreadyExistsError(e)) {
        this.logger.error('Subscription creation try : ', e);
        throw new Error(e);
      }
      await this.client.updatePersistentSubscriptionToStream(
        subscription.stream,
        subscription.group,
        {
          ...persistentSubscriptionToStreamSettingsFromDefaults(),
          ...subscription.settingsForCreation?.subscriptionSettings,
        },
        subscription.settingsForCreation?.baseOptions,
      );
    }
  }

  private static isNotAlreadyExistsError(e) {
    return e.code !== PERSISTENT_SUBSCRIPTION_ALREADY_EXIST_ERROR_CODE;
  }
}
