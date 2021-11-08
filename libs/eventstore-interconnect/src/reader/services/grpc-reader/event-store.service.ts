import { Inject, Injectable, Logger } from '@nestjs/common';

import { AppendResult } from '@eventstore/db-client/dist/types';
import * as constants from '@eventstore/db-client/dist/constants';
import { EventData } from '@eventstore/db-client/dist/types/events';
import { AppendToStreamOptions } from '@eventstore/db-client/dist/streams';
import {
  PersistentSubscription,
  persistentSubscriptionSettingsFromDefaults,
} from '@eventstore/db-client';
import { isNil } from '@nestjs/common/utils/shared.utils';
import { Client } from '@eventstore/db-client/dist/Client';
import { SUBSCRIPTIONS } from '../constants';
import { Credentials } from '../../../interconnection-configuration';
import { IPersistentSubscriptionConfig } from 'nestjs-geteventstore-next';
import { CREDENTIALS } from '../../../constants';
import { EVENT_STORE_CONNECTOR } from 'nestjs-geteventstore-next/dist/event-store/services/event-store.constants';
import { PERSISTENT_SUBSCRIPTION_ALREADY_EXIST_ERROR_CODE } from 'nestjs-geteventstore-next/dist/event-store/services/errors.constant';

@Injectable()
export class EventStoreService {
  private logger: Logger = new Logger(this.constructor.name);
  private persistentSubscriptions: PersistentSubscription[];

  constructor(
    @Inject(EVENT_STORE_CONNECTOR)
    private readonly eventStore: Client,
    @Inject(CREDENTIALS)
    private readonly credentials: Credentials,
    @Inject(SUBSCRIPTIONS)
    private readonly subscriptions: IPersistentSubscriptionConfig[],
  ) {}

  public async startWithOnEvent(onEvent: (event: any) => void): Promise<void> {
    this.persistentSubscriptions =
      await this.subscribeToPersistentSubscriptions(
        this.subscriptions,
        onEvent,
      );

    this.logger.log(`EventStore v21 connected`);
  }

  public async subscribeToPersistentSubscriptions(
    subscriptions: IPersistentSubscriptionConfig[] = [],
    onEvent: (event: any) => void,
  ): Promise<PersistentSubscription[]> {
    await this.upsertPersistentSubscriptions(subscriptions);

    return Promise.all(
      subscriptions.map(
        (
          subscription: IPersistentSubscriptionConfig,
        ): PersistentSubscription => {
          this.logger.log(
            `Connecting to persistent subscription "${subscription.group}" on stream "${subscription.stream}"...`,
          );
          const persistentSubscription: PersistentSubscription =
            this.eventStore.connectToPersistentSubscription(
              subscription.stream,
              subscription.group,
            );
          persistentSubscription.on('data', onEvent);
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
            `Connected to persistent subscription "${subscription.group}" on stream "${subscription.stream}" !`,
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
      await this.eventStore.createPersistentSubscription(
        subscription.stream,
        subscription.group,
        {
          ...persistentSubscriptionSettingsFromDefaults(),
          ...subscription.settingsForCreation?.subscriptionSettings,
          liveBufferSize: 1,
        },
        subscription.settingsForCreation?.baseOptions,
      );
      this.logger.log(
        `Persistent subscription "${subscription.group}" on stream ${subscription.stream} created.`,
      );
    } catch (e) {
      if (EventStoreService.isNotAlreadyExistsError(e)) {
        this.logger.error('Subscription creation try : ', e);
        throw new Error(e);
      }
      await this.eventStore.updatePersistentSubscription(
        subscription.stream,
        subscription.group,
        {
          ...persistentSubscriptionSettingsFromDefaults(),
          ...subscription.settingsForCreation.subscriptionSettings,
        },
        subscription.settingsForCreation.baseOptions,
      );
    }
  }

  private static isNotAlreadyExistsError(e) {
    return e.code !== PERSISTENT_SUBSCRIPTION_ALREADY_EXIST_ERROR_CODE;
  }

  public getPersistentSubscriptions(): PersistentSubscription[] {
    return this.persistentSubscriptions;
  }

  public async writeEvent(
    stream: string,
    events: EventData,
    expectedVersion: AppendToStreamOptions = {
      expectedRevision: constants.ANY,
    },
  ): Promise<AppendResult> {
    const appendResult: AppendResult = await this.eventStore.appendToStream(
      stream,
      events,
      { ...expectedVersion, ...this.credentials },
    );
    return appendResult;
  }

  // private async onEvent(event: any): Promise<any> {
  //   console.log('EVENT SPOTTED on v21 src : ', event);
  //   const validatedEvent = await this.validatorService.validate(event);
  //   await this.driver.writeEvent(validatedEvent);
  // }
}
