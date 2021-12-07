import { IEvent, IEventStoreEventOptions } from './eventstore-event';
import { IEventStorePersistentSubscriptionConfig } from './eventstore-persistent-subscription.config';

export interface IEventStoreBusConfig {
  subscriptions?: {
    persistent?: IEventStorePersistentSubscriptionConfig[];
  };
  eventMapper?: (data: any, options: IEventStoreEventOptions) => IEvent | false;
  onPublishFail?: (error: Error, events: IEvent[], eventStore: any) => void;
  publishAlsoLocally?: boolean;
}
