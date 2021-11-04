import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PersistentSubscriptionOptions } from 'geteventstore-promise';

import { EventStore } from './event-store';
import { EVENT_STORE, EVENT_STORE_SERVICE_CONFIG } from './constants';
import { IEventStoreBusConfig } from 'nestjs-geteventstore-legacy';
import { IPersistentSubscriptionConfig } from './persistent-subscription-config.interface';
import { Logger } from 'nestjs-pino-stackdriver';

@Injectable()
export class EventStoreService implements OnModuleDestroy, OnModuleInit {
  onModuleInit() {
    throw new Error('Method not implemented.');
  }
  onModuleDestroy() {
    throw new Error('Method not implemented.');
  }
  // constructor(
  //   @Inject(EVENT_STORE)
  //   private readonly eventStore: EventStore,
  //   @Inject(EVENT_STORE_SERVICE_CONFIG)
  //   private readonly config: IEventStoreBusConfig,
  //   private readonly logger: Logger,
  // ) {}
  //
  // async onModuleInit() {
  //   return await this.connect();
  // }
  //
  // async connect() {
  //   await this.eventStore.connect();
  //   this.logger.debug(`EventStore connected`);
  //
  //   if (this.config.subscriptions) {
  //     await this.subscribeToPersistentSubscriptions(
  //       this.config.subscriptions.persistent || [],
  //     );
  //   }
  //   // Wait for everything to be up before application boot
  //   return Promise.resolve(this);
  // }
  //
  // onModuleDestroy(): any {
  //   this.logger.log(`Destroy, disconnect EventStore`);
  //   this.eventStore.close();
  // }
  //
  // async subscribeToPersistentSubscriptions(
  //   subscriptions: IPersistentSubscriptionConfig[],
  // ) {
  //   await Promise.all(
  //     subscriptions.map(async (subscription) => {
  //       try {
  //         this.logger.log(
  //           `Check if persistent subscription "${subscription.group}" on stream ${subscription.stream} needs to be created `,
  //         );
  //         if (subscription.options.resolveLinktos !== undefined) {
  //           this.logger.warn(
  //             "DEPRECATED: The resolveLinktos parameter shouln't be used anymore. The resolveLinkTos parameter should be used instead.",
  //           );
  //         }
  //         await this.eventStore.HTTPClient.persistentSubscriptions.getSubscriptionInfo(
  //           subscription.group,
  //           subscription.stream,
  //         );
  //       } catch (e) {
  //         if (!e.response || e.response.status != 404) {
  //           throw e;
  //         }
  //         const options: PersistentSubscriptionOptions = {
  //           ...subscription.options,
  //           ...{
  //             resolveLinkTos:
  //               subscription.options.resolveLinkTos ||
  //               subscription.options.resolveLinktos,
  //           },
  //         };
  //         await this.eventStore.HTTPClient.persistentSubscriptions.assert(
  //           subscription.group,
  //           subscription.stream,
  //           options,
  //         );
  //         this.logger.log(
  //           `Persistent subscription "${subscription.group}" on stream ${subscription.stream} created ! ` +
  //             JSON.stringify(subscription.options),
  //         );
  //       }
  //     }),
  //   );
  //   await Promise.all(
  //     subscriptions.map(async (config) => {
  //       this.logger.log(
  //         `Connecting to persistent subscription "${config.group}" on stream ${config.stream}`,
  //       );
  //       return await this.eventStore.subscribeToPersistentSubscription(
  //         config.stream,
  //         config.group,
  //         (subscription, payload) => {
  //           this.logger.log(
  //             `Event spotted on subscription ${subscription}, payload : ${payload}`,
  //           );
  //         },
  //         config.autoAck,
  //         config.bufferSize,
  //         config.onSubscriptionStart,
  //         config.onSubscriptionDropped,
  //       );
  //     }),
  //   );
  // }
}
