import { Logger } from '@nestjs/common';
import { EventStoreVolatileSubscriptionConfig } from 'nestjs-geteventstore-1.6.4';

const onSubscriptionDropped = (sub, reason, error) => {
  Logger.error(`Subscription dropped : ${reason} ${error}\n exiting with code E#4#`);
  process.exit(4);
};

export const persistentSubscriptionsFacebook = [
  {
    stream: '$ce-eventbus_sync_facebook',
    group: 'facebook',
    autoAck: false,
    options: {
      resolveLinkTos: true,
      minCheckPointCount: 10,
      // startFrom: xxxx,
    },
    onSubscriptionDropped,
  },
  {
    stream: '$ce-facebook_sync',
    group: 'facebook',
    autoAck: false,
    options: {
      resolveLinkTos: true,
      minCheckPointCount: 10,
      // startFrom: xxxx,
    },
    onSubscriptionDropped,
  },
];

export const persistentSubscriptionsSegment = [
  {
    stream: '$ce-facebook_account',
    group: 'facebook-segment',
    autoAck: false,
    options: {
      resolveLinkTos: true,
      minCheckPointCount: 10,
      // startFrom: xxxx,
    },
    onSubscriptionDropped,
  },
  {
    stream: '$ce-facebook_sync',
    group: 'facebook-segment',
    autoAck: false,
    options: {
      resolveLinkTos: true,
      minCheckPointCount: 10,
      // startFrom: xxxx,
    },
    onSubscriptionDropped,
  },
];

export const volatileSubscriptionsEventbus = [
  {
    stream: '$ce-eventbus_sync',
    resolveLinkTos: true,
    onSubscriptionDropped,
  } as EventStoreVolatileSubscriptionConfig,
];

export const persistentSubscriptionsEventbus = [
  { // important to auto-ack : we don't want to "insist" if error occurs
    stream: '$ce-eventbus_sync',
    group: 'facebook-eventbus',
    autoAck: true, // important to auto-ack since there is no event.ack() in the code
    options: {
      resolveLinkTos: true,
      minCheckPointCount: 10,
      // startFrom: xxxx,
    },
    onSubscriptionDropped,
  },
];
