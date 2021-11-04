import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Reader } from '../reader';
import {
  EVENTSTORE_PERSISTENT_CONNECTION,
  HTTP_CLIENT,
} from './http-connection.constants';
import { Credentials } from '../../../interconnection-configuration';
import { Logger } from 'nestjs-pino-stackdriver';
import { SUBSCRIPTIONS } from '../constants';
import {
  HTTPClient,
  PersistentSubscriptionOptions,
} from 'geteventstore-promise';
import { EventStoreNodeConnection } from 'node-eventstore-client';
import { IEventStorePersistentSubscriptionConfig } from 'nestjs-geteventstore-legacy/dist/interfaces/subscription.interface';
import { CREDENTIALS } from '../../../constants';

@Injectable()
export class HttpReaderService implements Reader, OnModuleInit {
  constructor(
    @Inject(HTTP_CLIENT)
    private readonly client: HTTPClient,
    @Inject(EVENTSTORE_PERSISTENT_CONNECTION)
    private readonly eventStoreConnection: EventStoreNodeConnection,
    @Inject(SUBSCRIPTIONS)
    private readonly subscriptions: IEventStorePersistentSubscriptionConfig[],
    @Inject(CREDENTIALS)
    private readonly credentials: Credentials,
    private readonly logger: Logger,
  ) {}

  public async onModuleInit(): Promise<void> {
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
      await this.client.persistentSubscriptions.assert(
        subscription.group,
        subscription.stream,
        options,
      );
    }
    for (const subscription of this.subscriptions) {
      this.logger.log(
        `Connecting to persistent subscription "${subscription.group}" on stream ${subscription.stream}`,
      );
      await this.eventStoreConnection.connectToPersistentSubscription(
        subscription.stream,
        subscription.group,
        (subscription, event) => {
          console.log('EVENT SPOTTED');
          // console.log('subscription : ', subscription);
          // console.log('event : ', event);
        },
        (sub, reason, error) => {
          subscription.onSubscriptionDropped(sub, reason, error.message);
        },
        this.credentials,
        subscription.bufferSize,
        subscription.autoAck,
      );
    }
  }

  // async subscribeToPersistentSubscriptions(
  //   subscriptions: IPersistentSubscriptionConfig[],
  // ) {
  //   await Promise.all(
  //     subscriptions.map(async (subscription) => {
  //       await this.upsertSubscription(subscription);
  //     }),
  //   );
  //   await Promise.all(
  //     subscriptions.map(async (config) => {
  //       return await this.subscribeToSubscription(config);
  //     }),
  //   );
  // }
  //
  // private async subscribeToSubscription(config: IPersistentSubscriptionConfig) {
  //   this.logger.log(
  //     `Connecting to persistent subscription "${config.group}" on stream ${config.stream}`,
  //   );
  //   return await this.client.subscribeToPersistentSubscription(
  //     config.stream,
  //     config.group,
  //     (subscription, payload) => {
  //       this.logger.log(
  //         `Event spotted on subscription ${subscription}, payload : ${payload}`,
  //       );
  //     },
  //     config.autoAck,
  //     config.bufferSize,
  //     config.onSubscriptionStart,
  //     config.onSubscriptionDropped,
  //   );
  // }
  //
  // private async upsertSubscription(
  //   subscription: IEventStorePersistentSubscriptionConfig,
  // ) {
  //   try {
  //     this.logger.log(
  //       `Upsert "${subscription.group}" on stream ${subscription.stream}...`,
  //     );
  //     await this.eventStoreConnection.createPersistentSubscription(
  //       subscription.stream,
  //       subscription.group,
  //       PersistentSubscriptionSettings.create(),
  //       { username: 'admin', password: 'changeit' },
  //     );
  //   } catch (e) {
  //     console.log('e : ', JSON.stringify(e));
  //     if (!e.response || e.response.status != 404) {
  //       throw e;
  //     }
  //     const options: PersistentSubscriptionOptions = {
  //       ...subscription.options,
  //       ...{
  //         resolveLinkTos:
  //           subscription.options.resolveLinkTos ||
  //           subscription.options.resolveLinktos,
  //       },
  //     };
  //     await this.client.persistentSubscriptions.assert(
  //       subscription.group,
  //       subscription.stream,
  //       options,
  //     );
  //     this.logger.log(
  //       `Persistent subscription "${subscription.group}" on stream ${subscription.stream} created ! ` +
  //         JSON.stringify(subscription.options),
  //     );
  //   }
  // }
}
