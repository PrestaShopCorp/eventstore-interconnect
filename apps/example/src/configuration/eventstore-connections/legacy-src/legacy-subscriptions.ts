import { IEventStorePersistentSubscriptionConfig } from 'nestjs-geteventstore-legacy';

export const legacySubscriptions: IEventStorePersistentSubscriptionConfig[] = [
  {
    // Event stream category (before the -)
    stream: '$et-GoogleShoppingAccountOnboardedEvent',
    group: 'eventbus-interco',
    autoAck: true,
    bufferSize: 1,
    // Subscription is created with this options
    options: {
      resolveLinkTos: true,

      // checkpoint at every event
      minCheckPointCount: 1,

      // maximum number of concurrent events
      readBatchSize: 1,
    },
    onSubscriptionStart: () => {
      console.log('sub GoogleShoppingAccountOnboardedEvent started');
    },
    onSubscriptionDropped: () => {},
  },
  {
    // Event stream category (before the -)
    stream: '$ce-hero',
    group: 'data',
    autoAck: true,
    bufferSize: 1,
    // Subscription is created with this options
    options: {
      resolveLinkTos: true,

      // checkpoint at every event
      minCheckPointCount: 1,

      // maximum number of concurrent events
      readBatchSize: 1,
    },
    onSubscriptionStart: () => {
      console.log('sub hero started');
    },
    onSubscriptionDropped: () => {},
  },
];
