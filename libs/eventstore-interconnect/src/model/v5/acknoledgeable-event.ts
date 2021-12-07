import { PersistentSubscriptionNakEventAction } from 'node-eventstore-client';

export interface IAcknowledgeableEvent {
  ack: () => Promise<any>;
  nack: (
    action: PersistentSubscriptionNakEventAction,
    reason: string,
  ) => Promise<any>;
}
