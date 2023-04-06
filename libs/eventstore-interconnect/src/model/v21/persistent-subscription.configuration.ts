/// <reference types="node" />
import { DuplexOptions } from 'stream';
import {
  SubscribeToPersistentSubscriptionToStreamOptions,
  PersistentSubscriptionToStreamSettings,
  BaseOptions
} from '@eventstore/db-client';

export interface IPersistentSubscriptionConfig {
  stream: string;
  group: string;
  optionsForConnection?: {
    subscriptionConnectionOptions?: Partial<SubscribeToPersistentSubscriptionToStreamOptions>;
    duplexOptions?: Partial<DuplexOptions>;
  };
  settingsForCreation?: {
    subscriptionSettings?: Partial<PersistentSubscriptionToStreamSettings>;
    baseOptions?: Partial<BaseOptions>;
  };
  onSubscriptionStart?: () => void | undefined;
  onSubscriptionDropped?: (reason: string, error: string) => void | undefined;
  onError?: (error: Error) => void | undefined;
}
