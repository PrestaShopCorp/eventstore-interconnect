import { IPersistentSubscriptionConfig } from './v21/persistent-subscription.configuration';

export interface IEventStoreSubsystems {
  subscriptions?: {
    persistent?: IPersistentSubscriptionConfig[];
  };
  onEvent?: (sub: any, payload: any) => void;
  onConnectionFail?: (err: Error) => void;
}
