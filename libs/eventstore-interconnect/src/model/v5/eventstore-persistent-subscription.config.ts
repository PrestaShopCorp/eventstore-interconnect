import { PersistentSubscriptionOptions } from 'geteventstore-promise';
import { EventStorePersistentSubscription } from 'node-eventstore-client';

export declare type IEventStorePersistentSubscriptionConfig = {
  stream: string;
  group: string;
  options?: PersistentSubscriptionOptions & {
    resolveLinktos?: boolean;
  };
  autoAck?: boolean | undefined;
  bufferSize?: number | undefined;
  onSubscriptionStart?: (
    sub: EventStorePersistentSubscription,
  ) => void | undefined;
  onSubscriptionDropped?: (
    sub: EventStorePersistentSubscription,
    reason: string,
    error: string,
  ) => void | undefined;
};
